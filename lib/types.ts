export type RoomRecord = {
  id: string;
  name: string;
  capacity: number;
  required: number;
  voteCount: number;
  voteHashes: string[];
  cancelled: boolean;
  cancelledAt: number | null;
  createdAt: number;
  expiresAt: number;
};

export type RoomStatus = "pending" | "cancelled" | "expired";

/** Public payload — never includes vote counts or voter tokens. */
export type PublicRoom = {
  id: string;
  name: string;
  capacity: number;
  required: number;
  status: RoomStatus;
  cancelledAt: number | null;
};

export type CreateRoomInput = {
  name: string;
  capacity: number;
};

export type VoteFailure = "not_found" | "expired" | "already_cancelled";

export type VoteSuccess = {
  ok: true;
  alreadyVoted: boolean;
  justCancelled: boolean;
  room: RoomRecord;
};

export type VoteResult =
  | VoteSuccess
  | { ok: false; error: VoteFailure };
