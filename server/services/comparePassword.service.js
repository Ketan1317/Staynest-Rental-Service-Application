import bcrypt from 'bcryptjs';
const comparePassword = async(inputPass,hashPass) => {
    return await bcrypt.compare(inputPass, hashPass);
}

export default comparePassword;