import { mutation } from "./_generated/server";

// Seed the draftablePlayers table with NHL hockey players
export const seedDraftablePlayers = mutation({
    args: {},
    handler: async (ctx) => {
        // Check if players already exist
        const existingPlayers = await ctx.db.query("draftablePlayers").collect();
        if (existingPlayers.length > 0) {
            return { message: "Players already seeded", count: existingPlayers.length };
        }

        const players = [
            // Forwards
            { name: "Connor McDavid", position: "C", avatar: "https://cms.nhl.bamgrid.com/images/headshots/current/168x168/8478402.jpg" },
            { name: "Auston Matthews", position: "C", avatar: "https://cms.nhl.bamgrid.com/images/headshots/current/168x168/8479318.jpg" },
            { name: "Nathan MacKinnon", position: "C", avatar: "https://cms.nhl.bamgrid.com/images/headshots/current/168x168/8477492.jpg" },
            { name: "Leon Draisaitl", position: "C", avatar: "https://cms.nhl.bamgrid.com/images/headshots/current/168x168/8477934.jpg" },
            { name: "Sidney Crosby", position: "C", avatar: "https://cms.nhl.bamgrid.com/images/headshots/current/168x168/8471675.jpg" },
            { name: "David Pastrnak", position: "RW", avatar: "https://cms.nhl.bamgrid.com/images/headshots/current/168x168/8477956.jpg" },
            { name: "Nikita Kucherov", position: "RW", avatar: "https://cms.nhl.bamgrid.com/images/headshots/current/168x168/8476453.jpg" },
            { name: "Matthew Tkachuk", position: "LW", avatar: "https://cms.nhl.bamgrid.com/images/headshots/current/168x168/8479314.jpg" },
            { name: "Artemi Panarin", position: "LW", avatar: "https://cms.nhl.bamgrid.com/images/headshots/current/168x168/8478550.jpg" },
            { name: "Mikko Rantanen", position: "RW", avatar: "https://cms.nhl.bamgrid.com/images/headshots/current/168x168/8478420.jpg" },
            { name: "Jack Eichel", position: "C", avatar: "https://cms.nhl.bamgrid.com/images/headshots/current/168x168/8478403.jpg" },
            { name: "Elias Pettersson", position: "C", avatar: "https://cms.nhl.bamgrid.com/images/headshots/current/168x168/8481539.jpg" },
            { name: "Kirill Kaprizov", position: "LW", avatar: "https://cms.nhl.bamgrid.com/images/headshots/current/168x168/8478864.jpg" },
            { name: "Jason Robertson", position: "LW", avatar: "https://cms.nhl.bamgrid.com/images/headshots/current/168x168/8480027.jpg" },
            { name: "Mitch Marner", position: "RW", avatar: "https://cms.nhl.bamgrid.com/images/headshots/current/168x168/8478483.jpg" },
            { name: "Alex Ovechkin", position: "LW", avatar: "https://cms.nhl.bamgrid.com/images/headshots/current/168x168/8471214.jpg" },
            { name: "Brad Marchand", position: "LW", avatar: "https://cms.nhl.bamgrid.com/images/headshots/current/168x168/8473419.jpg" },
            { name: "Sebastian Aho", position: "C", avatar: "https://cms.nhl.bamgrid.com/images/headshots/current/168x168/8478427.jpg" },
            { name: "J.T. Miller", position: "C", avatar: "https://cms.nhl.bamgrid.com/images/headshots/current/168x168/8476468.jpg" },
            { name: "Kyle Connor", position: "LW", avatar: "https://cms.nhl.bamgrid.com/images/headshots/current/168x168/8478398.jpg" },

            // Defensemen
            { name: "Cale Makar", position: "D", avatar: "https://cms.nhl.bamgrid.com/images/headshots/current/168x168/8480069.jpg" },
            { name: "Roman Josi", position: "D", avatar: "https://cms.nhl.bamgrid.com/images/headshots/current/168x168/8474600.jpg" },
            { name: "Quinn Hughes", position: "D", avatar: "https://cms.nhl.bamgrid.com/images/headshots/current/168x168/8480800.jpg" },
            { name: "Adam Fox", position: "D", avatar: "https://cms.nhl.bamgrid.com/images/headshots/current/168x168/8479323.jpg" },
            { name: "Victor Hedman", position: "D", avatar: "https://cms.nhl.bamgrid.com/images/headshots/current/168x168/8475167.jpg" },
            { name: "Moritz Seider", position: "D", avatar: "https://cms.nhl.bamgrid.com/images/headshots/current/168x168/8481542.jpg" },
            { name: "Evan Bouchard", position: "D", avatar: "https://cms.nhl.bamgrid.com/images/headshots/current/168x168/8480803.jpg" },
            { name: "Josh Morrissey", position: "D", avatar: "https://cms.nhl.bamgrid.com/images/headshots/current/168x168/8477504.jpg" },
            { name: "Dougie Hamilton", position: "D", avatar: "https://cms.nhl.bamgrid.com/images/headshots/current/168x168/8476462.jpg" },
            { name: "Miro Heiskanen", position: "D", avatar: "https://cms.nhl.bamgrid.com/images/headshots/current/168x168/8480036.jpg" },
            { name: "Charlie McAvoy", position: "D", avatar: "https://cms.nhl.bamgrid.com/images/headshots/current/168x168/8479325.jpg" },
            { name: "Devon Toews", position: "D", avatar: "https://cms.nhl.bamgrid.com/images/headshots/current/168x168/8478438.jpg" },
            { name: "Aaron Ekblad", position: "D", avatar: "https://cms.nhl.bamgrid.com/images/headshots/current/168x168/8477932.jpg" },
            { name: "Rasmus Dahlin", position: "D", avatar: "https://cms.nhl.bamgrid.com/images/headshots/current/168x168/8480839.jpg" },
            { name: "Thomas Chabot", position: "D", avatar: "https://cms.nhl.bamgrid.com/images/headshots/current/168x168/8479975.jpg" },

            // Goalies
            { name: "Connor Hellebuyck", position: "G", avatar: "https://cms.nhl.bamgrid.com/images/headshots/current/168x168/8476945.jpg" },
            { name: "Igor Shesterkin", position: "G", avatar: "https://cms.nhl.bamgrid.com/images/headshots/current/168x168/8478048.jpg" },
            { name: "Andrei Vasilevskiy", position: "G", avatar: "https://cms.nhl.bamgrid.com/images/headshots/current/168x168/8476883.jpg" },
            { name: "Juuse Saros", position: "G", avatar: "https://cms.nhl.bamgrid.com/images/headshots/current/168x168/8477424.jpg" },
            { name: "Ilya Sorokin", position: "G", avatar: "https://cms.nhl.bamgrid.com/images/headshots/current/168x168/8478009.jpg" },
            { name: "Jake Oettinger", position: "G", avatar: "https://cms.nhl.bamgrid.com/images/headshots/current/168x168/8479979.jpg" },
            { name: "Jeremy Swayman", position: "G", avatar: "https://cms.nhl.bamgrid.com/images/headshots/current/168x168/8480280.jpg" },
            { name: "Alexandar Georgiev", position: "G", avatar: "https://cms.nhl.bamgrid.com/images/headshots/current/168x168/8478027.jpg" },
            { name: "Linus Ullmark", position: "G", avatar: "https://cms.nhl.bamgrid.com/images/headshots/current/168x168/8476999.jpg" },
            { name: "Frederik Andersen", position: "G", avatar: "https://cms.nhl.bamgrid.com/images/headshots/current/168x168/8475883.jpg" },
        ];

        const insertedPlayers = [];
        for (const player of players) {
            const id = await ctx.db.insert("draftablePlayers", player);
            insertedPlayers.push(id);
        }

        return {
            message: "Successfully seeded draftable players",
            count: insertedPlayers.length,
            playerIds: insertedPlayers,
        };
    },
});

// Clear all players (useful for development/testing)
export const clearDraftablePlayers = mutation({
    args: {},
    handler: async (ctx) => {
        const players = await ctx.db.query("draftablePlayers").collect();
        for (const player of players) {
            await ctx.db.delete(player._id);
        }
        return { message: "All players cleared", count: players.length };
    },
});

