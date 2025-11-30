const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
/**
 * Validators: conjunto de funções para validação de dados comuns.
 * 
 * - validateEmail(email): verifica se o email tem formato válido.
 * - validatePassword(password): verifica se a senha tem pelo menos 8 caracteres,
 *   com pelo menos uma letra maiúscula, uma minúscula e um número.
 * - validatePhone(phone): valida números de telefone no formato brasileiro.
 * - validateCPF(cpf): valida CPFs brasileiros com cálculo de dígitos verificadores.
 * - sanitizeString(str): remove espaços em excesso e caracteres potencialmente perigosos (< e >).
 * 
 * Exemplo de uso:
 * const { validateEmail, validatePassword } = require('./validators');
 * if (!validateEmail(user.email)) throw new Error('Email inválido');
 */

const validatePassword = (password) => {
    // Mínimo 8 caracteres, pelo menos uma letra maiúscula, uma minúscula e um número
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
};

const validatePhone = (phone) => {
    // Formato brasileiro: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
    const phoneRegex = /^\(\d{2}\)\s?\d{4,5}-?\d{4}$/;
    return phoneRegex.test(phone);
};

const validateCPF = (cpf) => {
    cpf = cpf.replace(/[^\d]/g, '');
    
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
        return false;
    }

    let sum = 0;
    let remainder;

    for (let i = 1; i <= 9; i++) {
        sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }

    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(9, 10))) return false;

    sum = 0;
    for (let i = 1; i <= 10; i++) {
        sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }

    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(10, 11))) return false;

    return true;
};

const sanitizeString = (str) => {
    return str.trim().replace(/[<>]/g, '');
};

module.exports = {
    validateEmail,
    validatePassword,
    validatePhone,
    validateCPF,
    sanitizeString
};
