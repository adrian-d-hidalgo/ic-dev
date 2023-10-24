#! /usr/bin/env ts-node
import { Command } from "commander";

import StateContainer from "./state-container";

// Import commands
import { createNewCommand } from "./commands/program/new";
import { createInitCommand } from "./commands/program/init";
import { createResetCommand } from "./commands/program/reset";
import { createDestroyCommand } from "./commands/program/destroy";
import { createDeployCommand } from "./commands/program/deploy";
import { createStartCommand } from "./commands/program/start";
import { createSshCommand } from "./commands/program/ssh";

const program = new Command();
const state = new StateContainer();

createNewCommand(program, state);

createInitCommand(program, state);

createResetCommand(program, state);

createDestroyCommand(program, state);

createDeployCommand(program, state);

createStartCommand(program, state);

createSshCommand(program, state);

program.parse();
