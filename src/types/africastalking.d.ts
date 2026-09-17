declare module "africastalking" {
  interface SMSSendParams {
    to: string[];
    message: string;
    from?: string;
  }

  interface SMSRecipient {
    number: string;
    status: string;
    messageId: string;
    cost?: string;
  }

  interface SMSSendResponse {
    SMSMessageData: {
      Message: string;
      Recipients: SMSRecipient[];
    };
  }

  interface AfricasTalkingClient {
    SMS: {
      send(params: SMSSendParams): Promise<SMSSendResponse>;
    };
  }

  function AfricasTalking(options: { apiKey: string; username: string }): AfricasTalkingClient;
  export default AfricasTalking;
}
