export declare type DamageType = 'physical' | 'magic' | 'fire' | 'lightning' | 'holy';
export declare type StatusEffectType = 'bleed' | 'frostbite' | 'poison' | 'scarlet_rot' | 'sleep' | 'madness';
export declare type DamageAttribute = 'strength' | 'dexterity' | 'intelligence' | 'faith' | 'arcane';
declare class ComputedValue {
    base: number;
    scaling: number;
    constructor(base: number, scaling: number);
    get total(): number;
}
export declare class AttackPower {
    values: Record<DamageType, ComputedValue>;
    constructor(values: Record<DamageType, ComputedValue>);
    get total(): number;
    get items(): ComputedValue[];
    map(callback: (key: DamageType, value: ComputedValue) => ComputedValue): AttackPower;
    static create(): AttackPower;
}
declare type StatusEffect = Record<StatusEffectType, ComputedValue>;
export declare type CorrectionAttack = {
    correction: Record<DamageType, Record<DamageAttribute, boolean>>;
    override: Record<DamageType, Partial<Record<DamageAttribute, number>>>;
    ratio: Record<DamageType, Record<DamageAttribute, number>>;
};
export declare type AffinityTypes = 'Standard' | 'Keen' | 'Heavy' | 'Magic' | 'Cold' | 'Fire' | 'Lightning' | 'Flame Art' | 'Sacred' | 'Poison' | 'Occult' | 'Blood';
export declare type CorrectionGraph = Record<string, number[]>;
export declare type AffinityProperties = {
    reinforcement_id: number;
    correction_attack_id: number;
    correction_calc_id: Partial<Record<DamageType | StatusEffectType, number>>;
    damage: Partial<Record<DamageType, number>>;
    status_effects: Partial<Record<StatusEffectType, number>>;
    status_effect_overlay: Partial<Record<StatusEffectType, number>>[];
    scaling: Partial<Record<DamageAttribute, number>>;
};
export declare type ReinforcementData = {
    damage: Partial<Record<DamageType, number>>;
    scaling: Partial<Record<DamageAttribute, number>>;
    level: number;
};
export declare type ArmamentData = {
    affinity: Partial<Record<AffinityTypes, AffinityProperties>>;
    requirements: Partial<Record<DamageAttribute, number>>;
};
export declare type CalculatorData = {
    armaments: Record<string, ArmamentData>;
    reinforcements: Record<string, ReinforcementData[]>;
    correction_attack: Record<string, CorrectionAttack>;
    correction_graph: CorrectionGraph;
};
export declare class ArmamentCalculator {
    name: string;
    affinity: AffinityTypes;
    level: number;
    constructor(name: string, affinity: AffinityTypes, level: number);
    gameData: {
        affinity_properties: AffinityProperties;
        requirements: Partial<Record<DamageAttribute, number>>;
        reinforcement: ReinforcementData;
        correction_attack: CorrectionAttack;
        correction_graph: CorrectionGraph;
    };
    importData(data: CalculatorData): void;
    attackPower(attributes: Record<DamageAttribute, number>): AttackPower;
    getBaseAndScaledDamage(attributes: Record<DamageAttribute, number>, attackType: DamageType): ComputedValue;
    getScalingPerAttribute(attackType: DamageType, attribute: DamageAttribute, value: number): number;
    statusEffect(attributes: Record<DamageAttribute, number>): StatusEffect;
    getBaseAndScaledEffect(attributes: Record<DamageAttribute, number>, effectType: StatusEffectType): ComputedValue;
}
export {};
