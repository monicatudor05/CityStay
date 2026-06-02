sirAlphaNum = ""
let v_intervale = [[48, 57], [65, 90], [97, 122]]
//[48,57] -digits: 0123456789
//[65,90] - ABCDEFGHIJKLMNOPQRSTUVXYZ uppercase
//[97, 122] -abcdefghijkl... lowercase
for (let interval of v_intervale) {

    for (let i = interval[0]; i <= interval[1]; i++) {
        sirAlphaNum += String.fromCharCode(i);

    }

}
console.log(sirAlphaNum);
//sirAlphaNum="0123456789ABCDE..abcde.."


function genereazaToken(n) {
    let token = "";
    for (let i = 0; i < n; i++) {
        token += sirAlphaNum[Math.floor(Math.random() * sirAlphaNum.length)];
    }
    return token;
}

module.exports.genereazaToken = genereazaToken;