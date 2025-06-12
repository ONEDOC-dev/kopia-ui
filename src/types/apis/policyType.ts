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