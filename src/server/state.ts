type SocketId = string;
type UserName = string;
type State = Record<
  SocketId,
  {
    id?: string; // username
    position?: number[];
    color?: number[];
  }
>;

export const users: State = {};
export const socketIds: Record<UserName, SocketId> = {};

export const USER_PUBLIC_FIELDS = ['id', 'position', 'color'];
