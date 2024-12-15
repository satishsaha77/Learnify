import mongoose, { Document, Model, Schema } from "mongoose";
import { Iuser } from "./user.model";


interface IComment extends Document {
    user: Iuser;
    question: string;
    questionReplies: IComment[];
}

interface IReview extends Document {
    user: Iuser;
    rating: number;
    comment: string;
    commentReplies?: IComment[];
}


interface ILink extends Document {
    title: string;
    url: string;
}

interface ICourseData extends Document {
    title: string;
    description: string;
    videoUrl: string;
    videoThumbnail: object;
    videoSection: string;
    videoLength: number;
    videoPlayer: string;
    links: ILink[];
    suggestion: string;
    questions: IComment[];
}

export interface ICourses extends Document {
    name: string;
    description: string;
    categories: string;
    price: number;
    estimatePrice?: number;
    thumbnail: object;
    tags: string;
    level: string;
    demoUrl: string;
    benefits: { title: string }[];
    prerequisites: { title: string }[];
    reviews: IReview[];
    courseData: ICourseData[];
    rating?: number;
    purchased: number;
}


const reviewSchema = new Schema<IReview>({
    user: Object,
    rating: {
        type: Number,
        default: 0,
    },
    comment: String,
    commentReplies: [Object],
}, { timestamps: true });

const linkSchema = new Schema<ILink>({
    title: String,
    url: String,
});


const commentSchema = new Schema<IComment>({
    user: Object,
    question: String,
    questionReplies: [Object],
}, { timestamps: true });

const courseDataSchema = new Schema<ICourseData>({
    title: String,
    description: String,
    videoThumbnail: Object,
    videoUrl: String,
    videoSection: String,
    videoLength: Number,
    videoPlayer: String,
    links: [linkSchema],
    suggestion: String,
    questions: [commentSchema],
});


const courseSchema = new Schema<ICourses>({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    categories: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    estimatePrice: {
        type: Number,
    },
    thumbnail: {
        public_id: {
            type: String,
        },
        url: {
            type: String,
        },
    },
    tags: {
        type: String,
        required: true,
    },
    level: {
        type: String,
        required: true,
    },
    demoUrl: {
        type: String,
        required: true,
    },
    benefits: [{ title: String }],
    prerequisites: [{ title: String }],
    reviews: [reviewSchema],
    courseData: [courseDataSchema],
    rating: {
        type: Number,
        default: 0,
    },
    purchased: {
        type: Number,
        default: 0,
    },

}, { timestamps: true });


const courseModel: Model<ICourses> = mongoose.model("Course", courseSchema);

export default courseModel;


