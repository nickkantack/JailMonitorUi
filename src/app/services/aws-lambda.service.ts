import { Injectable } from '@angular/core';
import {
  LambdaClient,
  InvokeCommand
} from '@aws-sdk/client-lambda';
import {
  fromCognitoIdentityPool
} from '@aws-sdk/credential-provider-cognito-identity';

@Injectable({
  providedIn: 'root'
})
export class LambdaService {
  private lambdaClient: LambdaClient | null = null;

  constructor() {
  }

  initializeWithCredentials(credentials: string) {
    const region = "us-east-1";
    const identityPoolId = credentials;

    this.lambdaClient = new LambdaClient({
      region,
      credentials: fromCognitoIdentityPool({
        clientConfig: { region },
        identityPoolId: identityPoolId
      })
    });
  }

  async invokeLambda(functionName: string, payload: any): Promise<any> {
    const command = new InvokeCommand({
      FunctionName: functionName,
      Payload: new TextEncoder().encode(JSON.stringify(payload))
    });

    if (!this.lambdaClient) {
      console.error(`Lambda client has not been initialized with credentials`);
      return;
    }

    try {
      const response = await this.lambdaClient.send(command);

      if (response.Payload) {
        const decoded = new TextDecoder('utf-8').decode(response.Payload);
        return JSON.parse(decoded);
      }

      throw new Error('No payload returned');
    } catch (err) {
      console.error('Lambda invoke error:', err);
      throw err;
    }
  }

  test() {
    console.log(`Everything is fine`);
  }
}