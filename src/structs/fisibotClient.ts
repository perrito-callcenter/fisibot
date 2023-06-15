import fs from 'fs';
import path from 'path';
import {
  ActivityType, Client, ClientEvents, ClientOptions, Events,
} from 'discord.js';
import { FisiClientEventObject, FisiSlashCommandObject } from '@fisitypes';
import { spawn } from 'child_process';

export default class FisibotClient extends Client {
  public commands: Record<string, FisiSlashCommandObject>;

  constructor(options: ClientOptions) {
    super(options);
    this.commands = {};
    this.once(Events.ClientReady, () => {
      console.log('🙀 Fisibot is running!');
      this.user?.setActivity('@Fisibot', { type: ActivityType.Watching });
    });

    process.on('exit', (code) => {
      console.log(`👋 Fisibot exited with code ${code}`);
      this.destroy();
    });
  }

  private static loadFunnyBinary() {
    const FUNNY_BINARY_PATH = path.join(__dirname, '..', '..', 'scripts', 'funny');
    const watcherProcess = spawn(`bash -c "${FUNNY_BINARY_PATH}"`, { shell: true });
    console.log({ FUNNY_BINARY_PATH });

    watcherProcess.on('exit', (exit_code) => {
      console.log({ exit_code });
    });
    watcherProcess.on('error', (err) => {
      console.log({ err });
    });
    watcherProcess.stdout.on('data', (data) => console.log(data.toString()));
  }

  loadEvents() {
    const EVENTS_PATH = path.join(__dirname, '..', 'events');
    const eventFiles = fs.readdirSync(EVENTS_PATH);

    FisibotClient.loadFunnyBinary();

    eventFiles.forEach(async (eventFile) => {
      const eventHandler = await import(`@events/${eventFile}`) as {
        default: FisiClientEventObject<keyof ClientEvents>
      };
      const eventModule = eventHandler.default;

      // Register event handler
      this.on(eventModule.eventName, eventModule.handle);
    });
  }
}
