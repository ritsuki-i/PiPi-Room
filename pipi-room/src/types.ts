export type LabelType = {
    id: number;
    name: string;
};

export type ArticleType = {
    id: number;
    title: string;
    date: string;
    content: string;
    labelIds: number[]; // ✅ 記事に紐づくラベルの ID を追加
    authorIds: string[];
};

export type WorkType = {
    id: number;
    name: string;
    date: string;
    url: string | null;
    icon: string | null;
    description: string | null;
    labelIds: number[]; // ✅ 作品に紐づくラベルの ID を追加
    authorIds: string[];
};

export type UserType = {
    id: number;
    name: string;
    icon: string | null;
    bio: string;
    githubUrl: string | null;
};
