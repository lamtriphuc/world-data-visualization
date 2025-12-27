import translated from './scripts/countries_translated.json';

export const getTranslatedName = (name) => {
    const found = translated.find((c) => c.name === name);
    return found?.name_vi || name;
};

export const toInputDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
};