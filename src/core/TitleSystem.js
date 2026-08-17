export class TitleSystem {
    constructor() {
        this.unlockedTitles = ['nameless_slime'];
        this.activeTitleId = 'nameless_slime';

        this.titleCatalog = {
            'nameless_slime': {
                id: 'nameless_slime',
                name: 'Nameless Slime',
                desc: 'A newly reincarnated, unidentified monster with zero reputation.',
                bonus: 'None',
                unlocked: true
            },
            'cave_explorer': {
                id: 'cave_explorer',
                name: 'Cave Explorer',
                desc: 'Harvested ancient Magisteel Ore & Hipokute Lotus from the subterranean deep.',
                bonus: '+10 Max MP',
                unlocked: false
            },
            'subterranean_predator': {
                id: 'subterranean_predator',
                name: 'Subterranean Predator',
                desc: 'Vanquished the ancient Tempest Serpent Leviathan.',
                bonus: '+5 ATK, +5 DEF',
                unlocked: false
            },
            'guardian_of_goblins': {
                id: 'guardian_of_goblins',
                name: 'Guardian of Goblins',
                desc: 'Saved the starving Goblin village from the Direwolf siege.',
                bonus: '+20 Max HP',
                unlocked: false
            },
            'true_demon_lord': {
                id: 'true_demon_lord',
                name: 'Great Demon Lord',
                desc: 'Harvested 10,000 souls and evolved through the Harvest Festival.',
                bonus: '+30 ATK, +20 DEF, +50 MP',
                unlocked: false
            }
        };

        this.load();
    }

    load() {
        try {
            const saved = localStorage.getItem('tempest_player_titles');
            if (saved) {
                const data = JSON.parse(saved);
                this.unlockedTitles = data.unlocked || ['nameless_slime'];
                this.activeTitleId = data.active || 'nameless_slime';
                for (const id of this.unlockedTitles) {
                    if (this.titleCatalog[id]) this.titleCatalog[id].unlocked = true;
                }
            }
        } catch(e) {}
    }

    save() {
        try {
            localStorage.setItem('tempest_player_titles', JSON.stringify({
                unlocked: this.unlockedTitles,
                active: this.activeTitleId
            }));
        } catch(e) {}
    }

    getActiveTitle() {
        return this.titleCatalog[this.activeTitleId] || this.titleCatalog['nameless_slime'];
    }

    unlockTitle(id, context) {
        if (!this.titleCatalog[id]) return;
        if (!this.unlockedTitles.includes(id)) {
            this.unlockedTitles.push(id);
            this.titleCatalog[id].unlocked = true;
            this.activeTitleId = id; // Auto-equip latest earned prestigious title
            this.save();

            const title = this.titleCatalog[id];
            if (context && context.sage) {
                context.sage.triggerLore(
                    `« REPORT: GREAT SAGE — New Title Acquired: [${title.name.toUpperCase()}]. Bonus: ${title.bonus} »`,
                    4.0
                );
            }
            if (context && context.floaterQueue) {
                context.floaterQueue.push({
                    text: `🏆 TITLE EARNED: ${title.name}`,
                    x: 480,
                    y: 140,
                    color: '#facc15',
                    lifetime: 3.0,
                    maxLifetime: 3.0
                });
            }
        }
    }
}
