import translated from './scripts/countries_translated.json';

export const getTranslatedName = (name) => {
    const found = translated.find((c) => c.name === name);
    return found?.name_vi || name;
};