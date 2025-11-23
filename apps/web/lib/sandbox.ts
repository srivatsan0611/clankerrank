import { Daytona } from "@daytonaio/sdk";

// Initialize the Daytona client
const daytona = new Daytona({ apiKey: process.env.DAYTONA_API_KEY });

type SandboxInstance = Awaited<ReturnType<typeof daytona.create>>;

export class Sandbox {
  private sandbox: SandboxInstance;

  private constructor(sandbox: SandboxInstance) {
    this.sandbox = sandbox;
  }

  static async create(language: string): Promise<Sandbox> {
    const sandboxInstance = await daytona.create({ language });
    return new Sandbox(sandboxInstance);
  }

  async run(
    code: string
  ): Promise<Awaited<ReturnType<SandboxInstance["process"]["codeRun"]>>> {
    const result = await this.sandbox.process.codeRun(code);
    return result;
  }

  async kill() {
    await this.sandbox.stop();
    await this.sandbox.delete();
  }

  async readFile(filename: string) {
    const file = await this.sandbox.fs.downloadFile(filename);
    return file.toString();
  }
}
