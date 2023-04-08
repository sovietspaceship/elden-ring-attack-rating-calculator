
import { expect } from 'chai';
import { ArmamentCalculator, ArmamentData, CorrectionAttack, CorrectionGraph, ReinforcementData } from '../src';

import Armaments from '../test-data/armaments.json';
import CorrectionAttackData from '../test-data/correction-attack.json';
import CorrectionGraphData from '../test-data/correction-graph.json';
import Reinforcements from '../test-data/reinforcements.json';

describe('AR calculation', () => {
    it('Standard Dagger +0 10/10/10/10/10 -> 82', () => {
        const calculator = new ArmamentCalculator('Dagger', 'Standard', 0);

        calculator.importData({
            armaments: Armaments as Record<string, ArmamentData>,
            correction_attack: CorrectionAttackData as Record<string, CorrectionAttack>,
            correction_graph: CorrectionGraphData as CorrectionGraph,
            reinforcements: Reinforcements as Record<string, ReinforcementData[]>
        });

        const ar = calculator.attackPower({
            strength: 10,
            dexterity: 10,
            intelligence: 10,
            faith: 10,
            arcane: 10,
        });

        expect(ar.total).to.equal(82);
    });

    it('Commander\'s Standard +7 33/21/34/54/23 -> 424', () => {
        const calculator = new ArmamentCalculator('Commander\'s Standard', 'Standard', 7);

        calculator.importData({
            armaments: Armaments as Record<string, ArmamentData>,
            correction_attack: CorrectionAttackData as Record<string, CorrectionAttack>,
            correction_graph: CorrectionGraphData as CorrectionGraph,
            reinforcements: Reinforcements as Record<string, ReinforcementData[]>
        });

        const ar = calculator.attackPower({
            strength: 33,
            dexterity: 21,
            intelligence: 34,
            faith: 54,
            arcane: 23,
        });

        expect(ar.total).to.equal(424);
    })

    it('Crystal Sword +0 23/23/11/10/10 -> 166', () => {
        const calculator = new ArmamentCalculator('Crystal Sword', 'Standard', 0);

        calculator.importData({
            armaments: Armaments as Record<string, ArmamentData>,
            correction_attack: CorrectionAttackData as Record<string, CorrectionAttack>,
            correction_graph: CorrectionGraphData as CorrectionGraph,
            reinforcements: Reinforcements as Record<string, ReinforcementData[]>
        });

        const ar = calculator.attackPower({
            strength: 23,
            dexterity: 23,
            intelligence: 11,
            faith: 10,
            arcane: 10,
        });

        expect(ar.total).to.equal(166);
    })

    it('Lightning Broadsword +14 23/23/11/10/10 -> 365', () => {
        const calculator = new ArmamentCalculator('Broadsword', 'Lightning', 14);

        calculator.importData({
            armaments: Armaments as Record<string, ArmamentData>,
            correction_attack: CorrectionAttackData as Record<string, CorrectionAttack>,
            correction_graph: CorrectionGraphData as CorrectionGraph,
            reinforcements: Reinforcements as Record<string, ReinforcementData[]>
        });

        const ar = calculator.attackPower({
            strength: 23,
            dexterity: 23,
            intelligence: 11,
            faith: 10,
            arcane: 10,
        });

        expect(ar.total).to.equal(365);
    })

    it('Poison Clayman\'s Harpoon +14 23/23/11/10/10 -> 365 AR / 83 poison', () => {
        const calculator = new ArmamentCalculator('Clayman\'s Harpoon', 'Poison', 14);

        calculator.importData({
            armaments: Armaments as Record<string, ArmamentData>,
            correction_attack: CorrectionAttackData as Record<string, CorrectionAttack>,
            correction_graph: CorrectionGraphData as CorrectionGraph,
            reinforcements: Reinforcements as Record<string, ReinforcementData[]>
        });

        const ar = calculator.attackPower({
            strength: 23,
            dexterity: 23,
            intelligence: 11,
            faith: 10,
            arcane: 10,
        });

        const status = calculator.statusEffect({
            strength: 23,
            dexterity: 23,
            intelligence: 11,
            faith: 10,
            arcane: 10,
        })

        expect(ar.total).to.equal(249);
        expect(status.poison.total).to.equal(83);
    })
})
