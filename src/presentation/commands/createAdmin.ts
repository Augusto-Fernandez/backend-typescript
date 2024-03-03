import { Command } from 'commander';
import UserManager from '../../domain/managers/userManager';

const CreateAdminCommand = new Command('addAdmin');

CreateAdminCommand
    .version('0.0.1')
    .description('Create admin')
    .option('-e, --email <email>', 'Admin`s email')
    .option('-u, --userName <userName>', 'Admin`s name')
    .option('-p, --password <password>', 'Admin`s password')
    .action(async (env) => {
        const payload = {
            ...env,
            isAdmin: true,
        };

        const manager = new UserManager();
        const user = await manager.create(payload);

        if (user) {
            console.log('Admin created successfully');
        }
    });

export default CreateAdminCommand;