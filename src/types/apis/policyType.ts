export interface GetPolicyRequest {
  userName: string;
  host: string;
  path: string;
}

export interface UpdatePolicyReqeust {
  body: {
    scheduling: {
      timeOfDay: {
        hour: number;
        min: number;
      }[];
    }
  },
  params: {
    userName: string;
    host: string;
    path: string;
  }
}