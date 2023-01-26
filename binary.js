(function() {
  let hexLookupTable = []
  for (let i = 0; i < 256; i++) {
    hexLookupTable.push(i.toString(16).padStart(2, "0"))
  }
  let noteNames = [
    "a-1","as-1","b-1","c0","cs0","d0","ds0","e0","f0","fs0","g0","gs0","a0","as0","b0",
    "c1","cs1","d1","ds1","e1","f1","fs1","g1","gs1","a1","as1","b1","c2","cs2","d2","ds2",
    "e2","f2","fs2","g2","gs2","a2","as2","b2","c3","cs3","d3","ds3","e3","f3","fs3","g3",
    "gs3","a3","as3","b3","c4","cs4","d4","ds4","e4","f4","fs4","g4","gs4","a4","as4","b4",
    "c5","cs5","d5","ds5","e5","f5","fs5","g5","gs5","a5","as5","b5","c6","cs6","d6","ds6",
    "e6","f6","fs6","g6","gs6","a6","as6","b6","c7"
  ]
  let noteIds = new Map()
  for (let i = 0; i < 88; i++) {
    noteIds.set(noteNames[i], i + 21)
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
      if (this.index >= this.length) throw new Error("Invalid buffer read")
      return this[this.index++]
    }
  
    readUInt16() {
      if (this.index + 2 > this.length) throw new Error("Invalid buffer read")
      let num = this[this.index] | (this[this.index + 1] << 8)
      this.index += 2
      return num
    }
  
    readUserId() {
      if (this.index + 12 > this.length) throw new Error("Invalid buffer read")
      let string = ""
      for (let i = 12; i--;) {
        string += hexLookupTable[this[this.index++]]
      }
      return string
    }
  
    readColor() {
      if (this.index + 3 > this.length) throw new Error("Invalid buffer read")
      let string = "#"
      for (let i = 3; i--;) {
        string += hexLookupTable[this[this.index++]]
      }
      return string
    }
  
    readBitflag(bit) {
      if (this.index >= this.length) throw new Error("Invalid buffer read")
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
          if (this.index >= this.length) throw new Error("Invalid buffer read")
          num += (thisValue & 0b1111111) * factor
        }
        factor *= 128
      }
    }
  
    readString() {
      let byteLength = this.readVarlong()
      if (this.index + byteLength > this.length) throw new Error("Invalid buffer read")
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
      for (let i = 12; i--;) {
        arr[i] = parseInt(value[i * 2] + value[i * 2 + 1], 16)
      }
      this.buffers.push(arr)
    }
  
    writeColor(value) {
      value = value.substring(1)
      let arr = new Uint8Array(new ArrayBuffer(3))
      for (let i = 3; i--;) {
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
            settings.color = reader.readColor()
            if (hasColor2) settings.color2 = reader.readColor()
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
                  x: reader.readUInt16() / 655.35,
                  y: reader.readUInt16() / 655.35
                }
                crown.endPos = {
                  x: reader.readUInt16() / 655.35,
                  y: reader.readUInt16() / 655.35
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
              this.channelCrown = crown
            }
            let participantCount = reader.readVarlong()
            message.ch.count = participantCount
            let ppl = []
            this.ppl = new Map()
            for (let i = 0; i < participantCount; i++) {
              let participant = {
                id: reader.readVarlong().toString(),
                _id: reader.readUserId(),
                name: reader.readString(),
                color: reader.readColor(),
                x: reader.readUInt16() / 655.35,
                y: reader.readUInt16() / 655.35
              }
              ppl.push(participant)
              this.ppl.set(participant.id, participant)
              if (crown && !crownDropped && participant._id === crown.userId) crown.participantId = participant.id
              if (participant._id === this.user._id) {
                message.p = participant.id
                this.participantId = participant.id
              }
            }
            message.ppl = ppl
            outArray.push(message)
            message = {
              m: "c",
              c: []
            }
            let chatMessageCount = reader.readVarlong()
            for (let i = chatMessageCount; i--;) {
              let chatMessage = {
                p: {
                  _id: reader.readUserId(),
                  name: reader.readString(),
                  color: reader.readColor()
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
            let count = reader.readVarlong()
            for (let i = count; i--;) {
              let id = reader.readVarlong().toString()
              let userIdChanged = reader.readBitflag(0)
              let nameChanged = reader.readBitflag(1)
              let colorChanged = reader.readBitflag(2)
              let mouseChanged = reader.readBitflag(3)
              reader.index++
              let userId
              if (userIdChanged) userId = reader.readUserId()
              let name
              if (nameChanged) name = reader.readString()
              let color
              if (colorChanged) color = reader.readColor()
              let mouseX, mouseY
              if (mouseChanged) {
                mouseX = reader.readUInt16() / 655.35
                mouseY = reader.readUInt16() / 655.35
              }
              let participant = this.ppl.get(id)
              if (participant) {
                if (userIdChanged) participant._id = userId
                if (nameChanged) participant.name = name
                if (colorChanged) participant.color = color
                if (mouseChanged) {
                  participant.x = mouseX
                  participant.y = mouseY
                }
              } else {
                participant = {
                  id,
                  _id: userId,
                  name,
                  color,
                  x: mouseX,
                  y: mouseY
                }
                this.ppl.set(id, participant)
              }
              if (userIdChanged || nameChanged || colorChanged) {
                outArray.push({
                  m: "p",
                  ...participant
                })
              }
              if (mouseChanged && !userIdChanged) {
                outArray.push({
                  m: "m",
                  id: id,
                  x: mouseX,
                  y: mouseY
                })
              }
            }
            break
          }
          case 0x04: {
            let count = reader.readVarlong()
            for (let i = count; i--;) {
              let id = reader.readVarlong().toString()
              this.ppl.delete(id)
              outArray.push({
                m: "bye",
                p: id
              })
            }
            break
          }
          case 0x05: {
            let actionId = reader.readUInt8()
            let channels = []
            let message = {
              m: "ls",
              c: [true, false][actionId],
              u: channels
            }
            let count = reader.readVarlong()
            for (let i = count; i--;) {
              let channel = {}

              let settings = {}
              settings.lobby = reader.readBitflag(0)
              settings.visible = reader.readBitflag(1)
              settings.chat = reader.readBitflag(2)
              settings.crownsolo = reader.readBitflag(3)
              settings["no cussing"] = reader.readBitflag(4)
              let hasColor2 = reader.readBitflag(5)
              reader.index++
              settings.color = reader.readColor()
              if (hasColor2) settings.color2 = reader.readColor()
              channel.settings = settings

              if (!settings.lobby) {
                let crown = {}
                crown.userId = reader.readUserId()
                let crownDropped = reader.readBitflag(0)
                reader.index++
                if (crownDropped) {
                  crown.time = reader.readVarlong()
                  crown.startPos = {
                    x: reader.readUInt16() / 655.35,
                    y: reader.readUInt16() / 655.35
                  }
                  crown.endPos = {
                    x: reader.readUInt16() / 655.35,
                    y: reader.readUInt16() / 655.35
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
                channel.crown = crown
              }
              
              channel.count = reader.readVarlong()

              channel._id = reader.readString()

              channels.push(channel)
            }
            outArray.push(message)
            break
          }
          case 0x06: {
            let actionId = reader.readUInt8()
            let ms = reader.readVarlong()
            if (actionId === 0x00) {
              let id = reader.readVarlong().toString()
              outArray.push({
                m: "kickban",
                p: id,
                ms
              })
              if (id === this.participantId) {
                outArray.push({
                  m: "notification",
                  title: "Notice",
                  text: `Banned from ${this.channelName} for ${Math.floor(ms / 60000)} minutes.`,
                  duration: 7000,
                  target: "#room",
                  class: "short"
                })
                break
              }
              if (!this.ppl.has(id)) break
              let participant = this.ppl.get(id)
              let crownHolder = null
              for (let participant of this.ppl.values()) {
                if (participant._id === this.channelCrown.userId) {
                  crownHolder = participant
                  break
                }
              }
              outArray.push({
                m: "notification",
                title: "Notice",
                text: `${crownHolder.name} banned ${participant.name} from the channel for ${Math.floor(ms / 60000)} minutes.`,
                duration: 7000,
                target: "#room",
                class: "short"
              })
              if (crownHolder === participant) {
                outArray.push({
                  m: "notification",
                  title: "Certificate of Award",
                  text: `Let it be known that ${participant.name} kickbanned him/her self.`,
                  duration: 7000,
                  target: "#room"
                })
              }
            } else {
              let channelName = reader.readString()
              outArray.push({
                m: "kickban",
                ms
              })
              outArray.push({
                m: "notification",
                title: "Notice",
                text: `Currently banned from ${channelName} for ${Math.ceil(ms / 60000)} minutes.`,
                duration: 7000,
                target: "#room",
                class: "short"
              })
            }
            break
          }
          case 0x07: {
            let id = reader.readVarlong().toString()
            let time = reader.readVarlong()
            let message = reader.readString()
            //in rare cases, a user can send a chat message, leave the channel, then another user joins the channel, all within a single tick
            //if this happens in that order, the user who joined will be sent this chat message from a participant they don't know about, which could cause errors
            //this prevents those errors by cancelling the message
            if (!this.ppl.has(id)) break
            outArray.push({
              m: "a",
              a: message,
              t: time,
              p: this.ppl.get(id)
            })
            break
          }
          case 0x08: {
            let participantId = reader.readVarlong().toString()
            let time = reader.readVarlong()
            let count = reader.readVarlong()
            if (participantId === this.participantId && this.recentSentNotes.get(time) === count) { //ignore notes we've sent
              this.recentSentNotes.delete(time)
              reader.index += count * 3
              break
            }
            let notes = []
            for (let i = count; i--;) {
              let note = {
                n: noteNames[reader.readUInt8() - 21]
              }
              let velocity = reader.readUInt8()
              if (velocity === 255) {
                note.s = 1
              } else {
                note.v = velocity / 127
              }
              let delay = reader.readUInt8()
              if (delay) note.d = delay
              notes.push(note)
            }
            if (!this.ppl.has(participantId)) break
            outArray.push({
              m: "n",
              p: participantId,
              t: time,
              n: notes
            })
            break
          }
          case 0x09: {
            let settings = {}
            settings.visible = reader.readBitflag(1)
            settings.chat = reader.readBitflag(2)
            settings.crownsolo = reader.readBitflag(3)
            settings["no cussing"] = reader.readBitflag(4)
            let hasColor2 = reader.readBitflag(5)
            reader.index++
            settings.color = reader.readColor()
            if (hasColor2) settings.color2 = reader.readColor()
            this.channelSettings = settings
            outArray.push({
              m: "ch",
              ppl: Array.from(this.ppl.values()),
              ch: {
                crown: this.channelCrown,
                settings: this.channelSettings,
                _id: this.channelName,
                count: this.ppl.size
              }
            })
            break
          }
          case 0x0a: {
            let userId = reader.readUserId()
            let isDropped = reader.readBitflag(0)
            reader.index++
            this.channelCrown.userId = userId
            if (isDropped) {
              delete this.channelCrown.participantId
              this.channelCrown.time = reader.readVarlong()
              this.channelCrown.startPos = {
                x: reader.readUInt16() / 655.35,
                y: reader.readUInt16() / 655.35
              }
              this.channelCrown.endPos = {
                x: reader.readUInt16() / 655.35,
                y: reader.readUInt16() / 655.35
              }
            } else {
              for (let participant of this.ppl.values()) {
                if (participant._id === userId) {
                  this.channelCrown.participantId = participant.id
                  break
                }
              }
            }
            outArray.push({
              m: "ch",
              ppl: Array.from(this.ppl.values()),
              ch: {
                crown: this.channelCrown,
                settings: this.channelSettings,
                _id: this.channelName,
                count: this.ppl.size
              }
            })
            break
          }
          default: {
            throw new Error("Binary parser was unable to parse message " + reader + " at " + reader.index)
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
            let settings = {
							visible: true,
							color: "#3b5054",
							chat: true,
							crownsolo: false,
							"no cussing": false
						}
						if (messageObj.set) Object.assign(settings, messageObj.set)
						let bitflags = 0
						if (settings.visible) bitflags = bitflags | 0b10
						if (settings.chat) bitflags = bitflags | 0b100
						if (settings.crownsolo) bitflags = bitflags | 0b1000
						if (settings["no cussing"]) bitflags = bitflags | 0b10000
						if (settings.color2) bitflags = bitflags | 0b100000
						writer.writeUInt8(bitflags)
						writer.writeColor(settings.color)
						if (settings.color2) writer.writeColor(settings.color2)
            break
          }
          case "t": {
            writer.writeUInt8(0x02)
            break
          }
          case "a": {
            writer.writeUInt8(0x03)
            writer.writeString(messageObj.message)
            break
          }
          case "n": {
            writer.writeUInt8(0x04)
            let time = Math.round(messageObj.t)
            writer.writeVarlong(time)
            writer.writeVarlong(messageObj.n.length)
            for (let time of this.recentSentNotes.keys()) { //filter out old recentSentNotes logs in case it didn't go through for whatever reason, to prevent memory buildup
              if (time - time < 10000) this.recentSentNotes.delete(time)
            }
            this.recentSentNotes.set(time, messageObj.n.length)
            for (let note of messageObj.n) {
              writer.writeUInt8(noteIds.get(note.n))
              if (note.s === 1) {
                writer.writeUInt8(255)
              } else {
                writer.writeUInt8(Math.round(note.v * 127))
              }
              if (note.d) {
                writer.writeUInt8(note.d)
              } else {
                writer.writeUInt8(0)
              }
            }
            break
          }
          case "m": {
            writer.writeUInt8(0x05)
            writer.writeUInt16(Math.round(parseFloat(messageObj.x) * 655.35))
            writer.writeUInt16(Math.round(parseFloat(messageObj.y) * 655.35))
            break
          }
          case "userset": {
            writer.writeUInt8(0x06)
            let bitflags = 0
            if ("name" in messageObj.set) bitflags = bitflags | 0b1
            if ("color" in messageObj.set) bitflags = bitflags | 0b10
            writer.writeUInt8(bitflags)
            if ("name" in messageObj.set) writer.writeString(messageObj.set.name)
            if ("color" in messageObj.set) writer.writeColor(messageObj.set.color)
            break
          }
          case "chown": {
            writer.writeUInt8(0x07)
            if ("id" in messageObj) {
              if (messageObj.id === this.participantId) {
                writer.writeUInt8(0x00)
              } else {
                writer.writeUInt8(0x02)
                writer.writeVarlong(messageObj.id)
              }
            } else {
              writer.writeUInt8(0x01)
            }
            break
          }
          case "chset": {
            writer.writeUInt8(0x08)
            let bitflags = 0
            if ("visible" in messageObj.set ? messageObj.set.visible : this.channelSettings.visible) bitflags = bitflags | 0b10
            if ("chat" in messageObj.set ? messageObj.set.chat : this.channelSettings.chat) bitflags = bitflags | 0b100
            if ("crownsolo" in messageObj.set ? messageObj.set.crownsolo : this.channelSettings.crownsolo) bitflags = bitflags | 0b1000
            if ("no cussing" in messageObj.set ? messageObj.set["no cussing"] : this.channelSettings["no cussing"]) bitflags = bitflags | 0b10000
            if ("color2" in messageObj.set) bitflags = bitflags | 0b100000
            writer.writeUInt8(bitflags)
            writer.writeColor("color" in messageObj.set ? messageObj.set.color : this.channelSettings.color)
            if ("color2" in messageObj.set) writer.writeColor(messageObj.set.color2)
            break
          }
          case "kickban": {
            writer.writeUInt8(0x09)
            writer.writeUserId(messageObj._id)
            writer.writeVarlong(messageObj.ms)
            break
          }
          case "unban": {
            writer.writeUInt8(0x0a)
            writer.writeUserId(messageObj._id)
            break
          }
          case "+ls": {
            writer.writeUInt8(0x0b)
            writer.writeUInt8(0x00)
            break
          }
          case "-ls": {
            writer.writeUInt8(0x0b)
            writer.writeUInt8(0x01)
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
      this.channelCrown = null
      this.user = null
      this.ppl = new Map()
      this.participantId = null
      this.recentSentNotes = new Map() //used to ignore own notes which do come through the binary protocol
    }
  }

  this.BinaryTranslator = BinaryTranslator
})()