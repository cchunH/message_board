export interface User {
  id: string;
  username: string;
}

export interface Comment {
  id: string;
  parentId: string | null;
  userId: string;
  userName: string;
  content: string;
  isDeleted: boolean;
  createdAt: string;
}

export interface CommentNode extends Comment {
  children: CommentNode[];
}
