import { Flamework } from "@flamework/core";
import { FlameworkIgnitionException } from "shared/exceptions";

try {
	Flamework.addPaths("src/server/services");
	Flamework.addPaths("src/server/components");
	Flamework.ignite();
} catch (e) {
	throw new FlameworkIgnitionException(<string>e);
}
