import AWS from "aws-sdk";

const functionName = process.env.AWS_LAMBDA_FUNCTION_NAME;

const client = new AWS.Lambda();

export default {
  available: () => !!functionName,
  dispatch: async jobData => {
    const lambdaPayload = JSON.stringify(job);
    if (lambdaPayload.length > 128000) {
      throw new Error("LAMBDA INVOCATION FAILED PAYLOAD TOO LARGE");
    }

    return client
      .invoke({
        FunctionName: functionName,
        InvocationType: "Event",
        Payload: lambdaPayload
      })
      .promise();
  }
};
