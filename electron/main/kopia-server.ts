import { ipcMain } from "electron";
import log from "electron-log";
import path from "path";
import https from "https";
import { defaultServerBinary } from "../utils/serverUtiles";
import { spawn } from "child_process";
import { configDir, isPortableConfig } from "../config/serverConfig";

let servers: { [key: string]: any } = {};
let statusPollInterval: NodeJS.Timeout | null = null; // polling interval 추적용

export const kopiaServer = () => {
  const repoID = "oneCLOUD-server";
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
      console.log("actuating Server");
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

      args.push("--config-file", path.resolve(configDir(), `${repoID}.config`));
      if (isPortableConfig()) {
        const cacheDir = path.resolve(configDir(), "cache", repoID);
        const logsDir = path.resolve(configDir(), "logs", repoID);
        args.push("--cache-directory", cacheDir);
        args.push("--log-dir", logsDir);
      }

      console.log(`========== Kopia server start ==========`);
      console.log(`Command: ${kopiaPath} ${args.join(" ")}`);
      console.log(`Config file: ${path.resolve(configDir(), repoID + ".config")}`);
      console.log(`=====================================`);
      
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

      // 기존 interval이 있다면 정리
      if (statusPollInterval) {
        clearInterval(statusPollInterval);
      }
      
      statusPollInterval = setInterval(pollOnce, pollInterval);

      runningServerProcess.on("close", (code: any, signal: any) => {
        this.appendToLog(
          `child process exited with code ${code} and signal ${signal}`,
        );
        if (runningServerProcess === p) {
          if (statusPollInterval) {
            clearInterval(statusPollInterval);
            statusPollInterval = null;
          }

          console.log(`========== Kopia server stop ==========`);
          console.log(`Termination code: ${code}`);
          console.log(`Termination signal: ${signal}`);
          console.log(`Previous server address: ${runningServerAddress || "없음"}`);
          console.log(`=======================================`);

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
    async stopServer() {
      return new Promise<void>((resolve) => {
        if (!runningServerProcess) {
          console.log("stopServer: server not started");
          resolve();
          return;
        }

        // polling interval을 즉시 정리
        if (statusPollInterval) {
          clearInterval(statusPollInterval);
          statusPollInterval = null;
        }

        console.log("Stopping kopia server...");
        
        const process = runningServerProcess;
        
        // 프로세스 종료 이벤트 리스너 등록
        const onClose = () => {
          console.log("Kopia server stopped successfully");
          resolve();
        };
        
        process.once('close', onClose);
        
        // SIGTERM으로 먼저 정상 종료 시도
        process.kill('SIGTERM');
        
        // 5초 후에도 종료되지 않으면 강제 종료
        setTimeout(() => {
          if (runningServerProcess === process) {
            console.log("Force killing kopia server...");
            process.kill('SIGKILL');
          }
        }, 5000);

        runningServerAddress = "";
        runningServerPassword = "";
        runningServerCertSHA256 = "";
        runningServerCertificate = "";
        runningServerProcess = null;
        this.raiseStatusUpdatedEvent();
      });
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
        
        console.log(`========== Kopia server info ==========`);
        console.log(`Server address: ${serverInfo.address}`);
        console.log(`Host: ${serverInfo.host}`);
        console.log(`Port: ${serverInfo.port}`);
        console.log(`Protocol: ${serverInfo.protocol.replace(':', '')}`);
        console.log(`Status: ${serverInfo.status}`);
        console.log(`runningServerControlPassword: ${runningServerControlPassword}`);          
        console.log(`Password: ${serverInfo.hasPassword ? '예' : '아니오'}`);
        console.log(`Certificate setting: ${serverInfo.hasCertificate ? '예' : '아니오'}`);
        if (serverInfo.certSHA256) {
          console.log(`Certificate SHA256: ${serverInfo.certSHA256}`);
        }
        console.log(`=============================================`);
        
      } catch (error) {
        console.log("Error parsing server address:", error);
        console.log(`Server address: ${runningServerAddress}`);
      }
    },
  }
}

export function serverForRepo() {
  return kopiaServer();
}