import { ipcMain } from "electron";
import log from "electron-log";
import path from "path";
import https from "https";
import { defaultServerBinary } from "../utils/serverUtiles";
import { spawn } from "child_process";
import { configDir, isPortableConfig } from "../config/serverConfig";

let servers: { [key: string]: any } = {};

const kopiaServer = (repoID: string) => {
  let runningServerProcess: any = null;
  let runningServerCertSHA256 = "";
  let runningServerPassword = "";
  let runningServerControlPassword = "";
  let runningServerAddress = "";
  let runningServerCertificate = "";
  let runningServerStatusDetails = {
    startingUp: true,
  };
  let serverLog = [];

  const maxLogLines = 100;

  return {
    actuateServer() {
      console.log("actuating Server", repoID);
      this.stopServer();
      this.startServer();
    },
    startServer() {
      let kopiaPath = defaultServerBinary();
      let args = [];

      args.push(
        "server",
        "start",
        "--insecure",
        "--without-password",
        "--disable-csrf-token-checks"
        // "--ui",
        // "--tls-print-server-cert",
        // "--tls-generate-cert-name=127.0.0.1",
        // "--random-password",
        // "--random-server-control-password",
        // "--tls-generate-cert",
        // "--async-repo-connect",
        // "--error-notifications=always",
        // "--kopiaui-notifications", // will print notification JSON to stderr
        // "--shutdown-on-stdin", // shutdown the server when parent dies
        // "--address=127.0.0.1:0",
      )

      args.push("--config-file", path.resolve(configDir(), repoID + ".config"));
      if (isPortableConfig()) {
        const cacheDir = path.resolve(configDir(), "cache", repoID);
        const logsDir = path.resolve(configDir(), "logs", repoID);
        args.push("--cache-directory", cacheDir);
        args.push("--log-dir", logsDir);
      }

      console.log(`========== 코피아 서버 시작 중 (${repoID}) ==========`);
      console.log(`실행 명령: ${kopiaPath} ${args.join(" ")}`);
      console.log(`config 파일: ${path.resolve(configDir(), repoID + ".config")}`);
      console.log(`========================================`);
      
      runningServerProcess = spawn(kopiaPath, args, {});
      this.raiseStatusUpdatedEvent();

      runningServerProcess.stdout.on("data", this.appendToLog.bind(this));
      runningServerProcess.stderr.on("data", this.detectServerParam.bind(this));

      const p = runningServerProcess;

      console.log("starting polling loop");

      const statusUpdated = this.raiseStatusUpdatedEvent.bind(this);

      const pollInterval = 3000;

      const pollOnce = () => {
        if (
          !runningServerAddress ||
          !runningServerCertificate ||
          !runningServerPassword ||
          !runningServerControlPassword
        ) {
          return;
        }

        const req = https.request({
          ca: [runningServerCertificate],
          host: '127.0.0.1',
          port: parseInt(new URL(runningServerAddress).port),
          method: 'GET',
          path: '/api/v1/control/status',
          timeout: pollInterval,
          headers: {
            authorization:
              `Basic ${Buffer.from(`server-control: ${runningServerControlPassword}`).toString('base64')}`
          }
        }, (res) => {
          if (res.statusCode === 200) {
            res.on('data', (x) => {
              try {
                const newDetails = JSON.parse(x);
                if (JSON.stringify(newDetails) !== JSON.stringify(runningServerStatusDetails)) {
                  const wasStartingUp = runningServerStatusDetails.startingUp;
                  runningServerStatusDetails = newDetails;
                  
                  // 서버가 시작업 상태에서 실행 상태로 변경된 경우 서버 정보 출력
                  if (wasStartingUp && !newDetails.startingUp) {
                    console.log("서버 시작 완료 - 상세 정보를 출력합니다.");
                    this.logServerInfo();
                  }
                  
                  statusUpdated();
                }
              } catch (e) {
                console.log("unable to parse status JSON", e);
              }
            });
          } else {
            console.log("error fetching status", res.statusMessage);
          }
        });
        req.on('error', (e) => {
          console.log("error fetching status", e);
        });
        req.end();
      }

      const statusPollInterval = setInterval(pollOnce, pollInterval);

      runningServerProcess.on("close", (code: any, signal: any) => {
        this.appendToLog(
          `child process exited with code ${code} and signal ${signal}`,
        );
        if (runningServerProcess === p) {
          clearInterval(statusPollInterval);

          console.log(`========== 코피아 서버 종료 (${repoID}) ==========`);
          console.log(`종료 코드: ${code}`);
          console.log(`종료 시그널: ${signal}`);
          console.log(`이전 서버 주소: ${runningServerAddress || "없음"}`);
          console.log(`========================================`);

          runningServerAddress = "";
          runningServerPassword = "";
          runningServerControlPassword = "";
          runningServerCertSHA256 = "";
          runningServerProcess = null;
          this.raiseStatusUpdatedEvent();
        }
      });
    },
    detectServerParam(data: any) {
      let lines = (data + "").split("\n");
      for (let i = 0; i < lines.length; i++) {
        const p = lines[i].indexOf(": ");
        if (p < 0) {
          continue;
        }

        const key = lines[i].substring(0, p);
        const value = lines[i].substring(p + 2);
        switch (key) {
          case "SERVER PASSWORD":
            runningServerPassword = value;
            this.raiseStatusUpdatedEvent();
            break;

          case "SERVER CONTROL PASSWORD":
            runningServerControlPassword = value;
            this.raiseStatusUpdatedEvent();
            break;

          case "SERVER CERT SHA256":
            runningServerCertSHA256 = value;
            this.raiseStatusUpdatedEvent();
            break;

          case "SERVER CERTIFICATE":
            runningServerCertificate = Buffer.from(value, "base64").toString(
              "ascii",
            );
            this.raiseStatusUpdatedEvent();
            break;

          case "SERVER ADDRESS":
            runningServerAddress = value;
            this.logServerInfo();
            this.raiseStatusUpdatedEvent();
            break;

          case "NOTIFICATION":
            try {
              this.raiseNotificationEvent(JSON.parse(value));
            } catch (e) {
              console.log("unable to parse notification JSON", e);
            }
            break;
        }
      }

      this.appendToLog(data);
    },
    appendToLog(data: any) {
      const l = serverLog.push(data);
      if (l > maxLogLines) {
        serverLog.splice(0, 1);
      }

      ipcMain.emit("logs-updated-event", {
        repoID: repoID,
        logs: serverLog.join(""),
      });
      console.log(`${data}`);
    },
    stopServer() {
      if (!runningServerProcess) {
        console.log("stopServer: server not started");
        return;
      }

      runningServerProcess.kill();
      runningServerAddress = "";
      runningServerPassword = "";
      runningServerCertSHA256 = "";
      runningServerCertificate = "";
      runningServerProcess = null;
      this.raiseStatusUpdatedEvent();
    },
    getServerAddress() {
      return runningServerAddress;
    },
    getServerCertSHA256() {
      return runningServerCertSHA256;
    },
    getServerPassword() {
      return runningServerPassword;
    },
    getServerStatusDetails() {
      return runningServerStatusDetails;
    },
    getServerStatus() {
      if (!runningServerProcess) {
        return "Stopped";
      }

      if (
        runningServerCertSHA256 &&
        runningServerAddress &&
        runningServerPassword
      ) {
        return "Running";
      }

      return "Starting";
    },
    raiseStatusUpdatedEvent() {
      const args = {
        repoID: repoID,
        status: this.getServerStatus(),
        serverAddress: this.getServerAddress() || "<pending>",
        serverCertSHA256: this.getServerCertSHA256() || "<pending>",
      };

      ipcMain.emit("status-updated-event", args);
    },
    raiseNotificationEvent(notification: any) {
      const args = {
        repoID: repoID,
        notification: notification,
      };

      ipcMain.emit("repo-notification-event", args);
    },
    logServerInfo() {
      if (runningServerAddress && runningServerPassword) {
        try {
          const url = new URL(runningServerAddress);
          const serverInfo = {
            repoID: repoID,
            address: runningServerAddress,
            host: url.hostname,
            port: url.port,
            protocol: url.protocol,
            status: this.getServerStatus(),
            hasPassword: !!runningServerPassword,
            hasCertificate: !!runningServerCertificate,
            certSHA256: runningServerCertSHA256
          };
          
          console.log(`========== 코피아 서버 실행 정보 (${repoID}) ==========`);
          console.log(`서버 주소: ${serverInfo.address}`);
          console.log(`호스트: ${serverInfo.host}`);
          console.log(`포트: ${serverInfo.port}`);
          console.log(`프로토콜: ${serverInfo.protocol.replace(':', '')}`);
          console.log(`상태: ${serverInfo.status}`);
          console.log(`runningServerControlPassword: ${runningServerControlPassword}`);          
          console.log(`패스워드 설정: ${serverInfo.hasPassword ? '예' : '아니오'}`);
          console.log(`인증서 설정: ${serverInfo.hasCertificate ? '예' : '아니오'}`);
          if (serverInfo.certSHA256) {
            console.log(`인증서 SHA256: ${serverInfo.certSHA256}`);
          }
          console.log(`=============================================`);
          
        } catch (error) {
          console.log("서버 주소 파싱 중 오류 발생:", error);
          console.log(`서버 주소: ${runningServerAddress}`);
        }
      }
    },
  }
}

ipcMain.on("status-fetch", (event, args) => {
  const repoID = args.repoID;
  const s = servers[repoID];
  if (s) {
    s.raiseStatusUpdatedEvent();
  }
});

export function serverForRepo(repoID: string) {
  let s = servers[repoID];
  if (s) {
    return s;
  }

  s = kopiaServer(repoID);
  servers[repoID] = s;
  return s;
}