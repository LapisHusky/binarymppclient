(function() {
  let hexLookupTable = []
  for (let i = 0; i < 256; i++) {
    hexLookupTable.push(i.toString(16).padStart(2, "0"))
  }
  let textEncoder = new TextEncoder()
  let textDecoder = new TextDecoder()

  class BinaryReader extends Uint8Array {
    constructor(arrayBuffer) {
      super(arrayBuffer)
      this.index = 0
    }
  
    reachedEnd() {
      return this.index >= this.length
    }
  
    readUInt8() {
      //no error checking in the client-side version, we trust the server
      //if (this.index >= this.length) throw new Error("Invalid buffer read")
      return this[this.index++]
    }
  
    readUInt16() {
      //if (this.index + 2 > this.length) throw new Error("Invalid buffer read")
      let num = this[this.index] | (this[this.index + 1] << 8)
      this.index += 2
      return num
    }
  
    readUserId() {
      //if (this.index + 12 > this.length) throw new Error("Invalid buffer read")
      let string = ""
      for (let i = 0; i < 12; i++) {
        string += hexLookupTable[this[this.index++]]
      }
      return string
    }
  
    readColor() {
      //if (this.index + 3 > this.length) throw new Error("Invalid buffer read")
      let string = ""
      for (let i = 0; i < 3; i++) {
        string += hexLookupTable[this[this.index++]]
      }
      return string
    }
  
    readBitflag(bit) {
      //if (this.index >= this.length) throw new Error("Invalid buffer read")
      return (this[this.index] >> bit & 0b1) === 1
    }
  
    readVarlong() {
      let num = this[this.index++]
      if (num < 128) return num
      num = num & 0b1111111
      let factor = 128
      while (true) {
        //we don't really need to check if this varlong is too long
        let thisValue = this[this.index++]
        if (thisValue < 128) {
          return num + thisValue * factor
        } else {
          //if (this.index >= this.length) throw new Error("Invalid buffer read")
          num += (thisValue & 0b1111111) * factor
        }
        factor *= 128
      }
    }
  
    readString() {
      let byteLength = this.readVarlong()
      //if (this.index + byteLength > this.length) throw new Error("Invalid buffer read")
      let string = textDecoder.decode(this.buffer.slice(this.index, this.index + byteLength))
      this.index += byteLength
      return string
    }
  }
  
  class BinaryWriter {
    constructor() {
      this.buffers = []
    }
  
    writeUInt8(value) {
      let arr = new Uint8Array(new ArrayBuffer(1))
      arr[0] = value
      this.buffers.push(arr)
    }
  
    writeUInt16(value) {
      let arr = new Uint8Array(new ArrayBuffer(2))
      arr[0] = value & 0xff
      arr[1] = value >>> 8
      this.buffers.push(arr)
    }
  
    writeUserId(value) {
      let arr = new Uint8Array(new ArrayBuffer(12))
      for (let i = 0; i < 12; i++) {
        arr[i] = parseInt(value[i * 2] + value[i * 2 + 1], 16)
      }
      this.buffers.push(arr)
    }
  
    writeColor(value) {
      let arr = new Uint8Array(new ArrayBuffer(3))
      for (let i = 0; i < 3; i++) {
        arr[i] = parseInt(value[i * 2] + value[i * 2 + 1], 16)
      }
      this.buffers.push(arr)
    }
  
    writeVarlong(value) {
      let length = 1
      let threshold = 128
      while (value >= threshold) {
        length++
        threshold *= 128
      }
      let arr = new Uint8Array(new ArrayBuffer(length))
      for (let i = 0; i < length - 1; i++) {
        let segment = value % 128
        value = Math.floor(value / 128)
        arr[i] = 0b10000000 | segment
      }
      arr[length - 1] = value
      this.buffers.push(arr)
    }
  
    writeString(string) {
      let stringBuffer = textEncoder.encode(string)
      this.writeVarlong(stringBuffer.length)
      this.buffers.push(stringBuffer)
    }
  
    getBuffer() {
      let length = 0
      for (let buffer of this.buffers) {
        length += buffer.length
      }
      let outputBuffer = new Uint8Array(new ArrayBuffer(length))
      let index = 0
      for (let buffer of this.buffers) {
        outputBuffer.set(buffer, index)
        index += buffer.length
      }
      return outputBuffer.buffer
    }
  }

  class BinaryTranslator {
    constructor() {
      this.reset()
    }

    receive(message) {
      let reader = new BinaryReader(message)
      let outArray = []
      while (!reader.reachedEnd()) {
        let opcode = reader.readUInt8()
        switch (opcode) {
          case 0x00: {
            let serverTime = reader.readVarlong()
            let id = reader.readUserId()
            let name = reader.readString()
            let color = reader.readColor()
            this.user = {
              _id: id,
              name,
              color
            }
            outArray.push({
              m: "hi",
              t: serverTime,
              u: {
                _id: id,
                name,
                color
              }
            })
            break
          }
          case 0x01: {
            let channelName = reader.readString()
            this.channelName = channelName
            let message = {
              m: "ch",
              ch: {
                _id: channelName,
              }
            }
            let settings = {}
            settings.lobby = reader.readBitflag(0)
            settings.visible = reader.readBitflag(1)
            settings.chat = reader.readBitflag(2)
            settings.crownsolo = reader.readBitflag(3)
            settings["no cussing"] = reader.readBitflag(4)
            let hasColor2 = reader.readBitflag(5)
            reader.index++
            settings.color = "#" + reader.readColor()
            if (hasColor2) settings.color2 = "#" + reader.readColor()
            message.ch.settings = settings
            this.channelSettings = settings
            let crown
            let crownDropped
            if (!settings.lobby) {
              crown = {}
              crown.userId = reader.readUserId()
              crownDropped = reader.readBitflag(0)
              reader.index++
              if (crownDropped) {
                crown.time = reader.readVarlong()
                crown.startPos = {
                  x: reader.readUInt16(),
                  y: reader.readUInt16()
                }
                crown.endPos = {
                  x: reader.readUInt16(),
                  y: reader.readUInt16()
                }
              } else {
                crown.time = 0
                crown.startPos = {
                  x: 50,
                  y: 50
                }
                crown.endPos = {
                  x: 50,
                  y: 50
                }
              }
              message.ch.crown = crown
            }
            let participantCount = reader.readVarlong()
            message.ch.count = participantCount
            let ppl = []
            for (let i = 0; i < participantCount; i++) {
              let participant = {
                id: reader.readVarlong(),
                _id: reader.readUserId(),
                name: reader.readString(),
                color: "#" + reader.readColor(),
                x: reader.readUInt16() / 65535,
                y: reader.readUInt16() / 65535
              }
              ppl.push(participant)
              if (crown && !crownDropped && participant._id === crown.userId) crown.participantId = participant.id
              if (participant._id === this.user._id) message.p = participant.id
            }
            message.ppl = ppl
            outArray.push(message)
            message = {
              m: "c",
              c: []
            }
            let chatMessageCount = reader.readVarlong()
            for (let i = 0; i < chatMessageCount; i++) {
              let chatMessage = {
                u: {
                  _id: reader.readUserId(),
                  name: reader.readString(),
                  color: "#" + reader.readColor()
                },
                t: reader.readVarlong(),
                a: reader.readString()
              }
              message.c.push(chatMessage)
            }
            outArray.push(message)
            break
          }
          case 0x02: {
            let serverTime = reader.readVarlong()
            outArray.push({
              m: "t",
              t: serverTime
            })
            break
          }
          case 0x03: {
            return []
            break
          }
        }
      }
      return outArray
    }

    send(message) {
      let writer = new BinaryWriter()
      for (let messageObj of message) {
        switch (messageObj.m) {
          case "hi": {
            writer.writeUInt8(0x00)
            if (messageObj.customId) {
              writer.writeVarlong(messageObj.customId)
            } else {
              writer.writeVarlong(0)
            }
            break
          }
          case "ch": {
            writer.writeUInt8(0x01)
            writer.writeString(messageObj._id)
            if (messageObj.set) {
              writer.writeUInt8(0b1)
              let settings = {
                visible: true,
                color: "#3b5054",
                chat: true,
                crownsolo: false,
                "no cussing": false
              }
              Object.assign(settings, messageObj.set)
              let bitflags = 0
              if (settings.visible) bitflags = bitflags | 0b10
              if (settings.chat) bitflags = bitflags | 0b100
              if (settings.crownsolo) bitflags = bitflags | 0b1000
              if (settings["no cussing"]) bitflags = bitflags | 0b10000
              if (settings.color2) bitflags = bitflags | 0b100000
              writer.writeUInt8(bitflags)
              writer.writeColor(settings.color.substring(1))
              if (settings.color2) writer.writeColor(settings.color2.substring(1))
            } else {
              writer.writeUInt8(0b0)
            }
            break
          }
          case "t": {
            writer.writeUInt8(0x02)
            break
          }
        }
      }
      return writer.getBuffer()
    }

    reset() {
      this.channelName = null
      this.channelSettings = {
        visible: true,
        color: "#3b5054",
        chat: true,
        crownsolo: false,
        "no cussing": false
      }
      this.user = null
    }
  }

  window.BinaryTranslator = BinaryTranslator
})()