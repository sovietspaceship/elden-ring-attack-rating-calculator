
export type DamageType = 'physical' | 'magic' | 'fire' | 'lightning' | 'holy';
export type StatusEffectType = 'bleed' | 'frostbite' | 'poison' | 'scarlet_rot' | 'sleep' | 'madness';
export type DamageAttribute = 'strength' | 'dexterity' | 'intelligence' | 'faith' | 'arcane';

class ComputedValue {
    constructor(public base: number, public scaling: number) { }

    get total(): number {
        return Math.floor(this.base + this.scaling)
    }
}

export class AttackPower {
    constructor(public values: Record<DamageType, ComputedValue>) { }

    get total(): number {
        return Math.floor(this.items.reduce((acc, value) => acc + value.total, 0));
    }

    get items() {
        return Object.values(this.values);
    }

    map(callback: (key: DamageType, value: ComputedValue) => ComputedValue) {
        return new AttackPower((['physical', 'fire', 'lightning', 'magic', 'holy'] as DamageType[]).reduce((acc, key: DamageType) => {
            return {
                ...acc,
                [key]: callback(key, this.values[key]),
            }
        }, {} as Record<DamageType, ComputedValue>));
    }

    static create() {
        return new AttackPower({ fire: new ComputedValue(0, 0), holy: new ComputedValue(0, 0), lightning: new ComputedValue(0, 0), magic: new ComputedValue(0, 0), physical: new ComputedValue(0, 0) })
    }
}

type StatusEffect = Record<StatusEffectType, ComputedValue>

export type CorrectionAttack = {
    correction: Record<DamageType, Record<DamageAttribute, boolean>>
    override: Record<DamageType, Partial<Record<DamageAttribute, number>>>
    ratio: Record<DamageType, Record<DamageAttribute, number>>
}

export type AffinityTypes = 'Standard' | 'Keen' | 'Heavy' | 'Magic' | 'Cold' | 'Fire' | 'Lightning' | 'Flame Art' | 'Sacred' | 'Poison' | 'Occult' | 'Blood'

export type CorrectionGraph = Record<string, number[]>

export type AffinityProperties = {
    reinforcement_id: number,
    correction_attack_id: number,
    correction_calc_id: Partial<Record<DamageType | StatusEffectType, number>>,
    damage: Partial<Record<DamageType, number>>
    status_effects: Partial<Record<StatusEffectType, number>>
    status_effect_overlay: Partial<Record<StatusEffectType, number>>[]
    scaling: Partial<Record<DamageAttribute, number>>
}

export type ReinforcementData = {
    damage: Partial<Record<DamageType, number>>
    scaling: Partial<Record<DamageAttribute, number>>
    level: number
}

export type ArmamentData = {
    affinity: Partial<Record<AffinityTypes, AffinityProperties>>
    requirements: Partial<Record<DamageAttribute, number>>
}

export type CalculatorData = {
    armaments: Record<string, ArmamentData>
    reinforcements: Record<string, ReinforcementData[]>
    correction_attack: Record<string, CorrectionAttack>
    correction_graph: CorrectionGraph
}

export class ArmamentCalculator {
    constructor(public name: string, public affinity: AffinityTypes, public level: number) { }

    gameData: {
        affinity_properties: AffinityProperties
        requirements: Partial<Record<DamageAttribute, number>>
        reinforcement: ReinforcementData
        correction_attack: CorrectionAttack
        correction_graph: CorrectionGraph
    }

    importData(data: CalculatorData) {
        const affinityProperties = data.armaments[this.name].affinity[this.affinity];
        const reinforcementId = affinityProperties.reinforcement_id;
        const correctionAttackId = affinityProperties.correction_attack_id;
        this.gameData = {
            affinity_properties: affinityProperties,
            requirements: data.armaments[this.name].requirements,
            reinforcement: data.reinforcements[reinforcementId.toString()][this.level],
            correction_attack: data.correction_attack[correctionAttackId],
            correction_graph: data.correction_graph,
        }
    }

    attackPower(attributes: Record<DamageAttribute, number>) {
        return AttackPower.create().map(attackType => this.getBaseAndScaledDamage(attributes, attackType));
    }

    getBaseAndScaledDamage(attributes: Record<DamageAttribute, number>, attackType: DamageType) {
        const base = (this.gameData.affinity_properties.damage[attackType] || 0) * (this.gameData.reinforcement.damage[attackType] || 0);
        const scalings: number[] = Object.keys(attributes).map((attribute: DamageAttribute) => {
            return this.getScalingPerAttribute(attackType, attribute, attributes[attribute] || 0);
        })
        const lowCap = Math.min(...scalings);
        const scalingValue = Math.max(lowCap, scalings.reduce((acc, s) => acc + s));
        return new ComputedValue(base, base * scalingValue);
    }

    getScalingPerAttribute(attackType: DamageType, attribute: DamageAttribute, value: number): number {
        // attack type does not scale with this attribute
        if (!this.gameData.correction_attack.correction[attackType][attribute]) {
            return 0.0
        }

        // get the impact ratio of the scaling for this attack type and attribute
        const scaling_impact_ratio = this.gameData.correction_attack.ratio[attackType][attribute] || 0;

        // requirement is not met, penalize scaling of this attack type for this attribute
        if (value < this.gameData.requirements[attribute]) {
            return 0.6 * (scaling_impact_ratio - 1) - 0.4;
        }

        // get scaling values for armament and its particular reinforcement level
        const base_scaling = this.gameData.affinity_properties.scaling[attribute] || 0;
        const level_scaling = this.gameData.reinforcement.scaling[attribute] || 0;

        // override base scaling if an override is defined
        const final_base_scaling = this.gameData.correction_attack.override[attackType][attribute] || base_scaling;

        // get correction for scaling based on the attribute value
        const correction_id = this.gameData.affinity_properties.correction_calc_id[attackType]
        const scaling_correction = this.gameData.correction_graph[correction_id][value]

        // return actual scaled value for this attack type and attribute
        return scaling_impact_ratio - 1 + final_base_scaling * level_scaling * scaling_correction * scaling_impact_ratio
    }

    statusEffect(attributes: Record<DamageAttribute, number>) {
        const results: StatusEffect = {
            bleed: new ComputedValue(0, 0),
            frostbite: new ComputedValue(0, 0),
            poison: new ComputedValue(0, 0),
            scarlet_rot: new ComputedValue(0, 0),
            sleep: new ComputedValue(0, 0),
            madness: new ComputedValue(0, 0)
        }
        for (const status in results) {
            results[status as StatusEffectType] = this.getBaseAndScaledEffect(attributes, status as StatusEffectType);
        }
        return results;
    }

    getBaseAndScaledEffect(attributes: Record<DamageAttribute, number>, effectType: StatusEffectType): ComputedValue {
        let base = this.gameData.affinity_properties.status_effects[effectType] || 0;
        const overlays = this.gameData.affinity_properties.status_effect_overlay;
        const level = this.gameData.reinforcement.level;

        // overwrite base value if the effect upgrades for the affinity
        if (overlays.length > level && overlays[level][effectType]) {
            base = overlays[level][effectType]
        }

        // retrieve scaling value if the effect can scale
        const correctionId = this.gameData.affinity_properties.correction_calc_id[effectType];
        if (correctionId) {
            const base_scaling = this.gameData.affinity_properties.scaling.arcane;
            const level_scaling = this.gameData.reinforcement.scaling.arcane;
            const scaling_correction = this.gameData.correction_graph[correctionId][attributes.arcane]

            return new ComputedValue(base, base * base_scaling * level_scaling * scaling_correction)
        }

        return new ComputedValue(base, 0.0)
    }
}
