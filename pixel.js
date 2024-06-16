let values = [215, 190, 189, 188];

for (let c = 0; c < values.length; c++) {
  let character = String.fromCharCode(values[c]);
  if (character.length > 0) {
    console.log(values[c], " --> ", String.fromCharCode(values[c]));
  }
}
