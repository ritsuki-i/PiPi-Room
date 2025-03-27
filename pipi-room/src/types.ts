export type LabelType = {
    id: number;
    name: string;
};

export type TechnologieType = {
    id: number;
    name: string;
};

export type ArticleType = {
    id: number;
    title: string;
    date: string;
    content: string;
    labelIds: number[]; // ✅ 記事に紐づくラベルの ID を追加
    technologieIds: number[];
    authorIds: string[];
    type: string;
};

export type WorkType = {
    id: number;
    name: string;
    date: string;
    url: string | null;
    githubUrl: string | null,
    icon: string | null;
    description: string | null;
    labelIds: number[]; // ✅ 作品に紐づくラベルの ID を追加
    technologieIds: number[];
    authorIds: string[];
    type: string;
};

export type UserType = {
    id: string;
    name: string;
    accountName: string;
    icon: string | null;
    bio: string;
    portfolioUrl: string | null;
    githubUrl: string | null;
    type: string | null;
};
