import { Networking } from "@flamework/networking";
import { createBinarySerializer } from "@rbxts/flamework-binary-serializer";

import type { PlayerData } from "./data-models/player-data";

type SerializedRemote = (packet: SerializedPacket) => void;
type UnreliableSerializedRemote = Networking.Unreliable<(packet: SerializedPacket) => void>;

interface ServerEvents {
  data: {
    initialize(): void;
  };
  character: {
    toggleDefaultMovement(on: boolean): void;
  };
}

interface ClientEvents {
  audio: {
    played: SerializedRemote;
  };
  data: {
    loaded: SerializedRemote;
    updated: SerializedRemote;
  };
}

interface ServerFunctions { }

interface ClientFunctions { }

export const Serializers = {
  playerData: createBinarySerializer<PlayerData>()
};

export const GlobalEvents = Networking.createEvent<ServerEvents, ClientEvents>();
export const GlobalFunctions = Networking.createFunction<ServerFunctions, ClientFunctions>();