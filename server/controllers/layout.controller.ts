import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/errorhandler";
import { catchAsyncerror } from "../middleware/catchAsyncError";
import layoutModel from "../models/layout.model";
import cloudinary from "cloudinary";



//Create Layout
export const createLayout = catchAsyncerror(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { type } = req.body;
        const isTypeExists = await layoutModel.findOne({ type });
        if (isTypeExists) {
            return next(new ErrorHandler(`${type} already Exists`, 400));
        }
        if (type === "Banner") {
            const { image, title, subTitle } = req.body;
            const myCloud = await cloudinary.v2.uploader.upload(image, {
                folder: "Layout",
            });
            const banner = {
                type: "Banner",
                banner: {
                    image: {
                        public_id: myCloud.public_id,
                        url: myCloud.secure_url,
                    },
                },
                title,
                subTitle,
            }

            await layoutModel.create(banner);
        }
        if (type === 'FAQ') {
            const { faqData } = req.body;
            const faqItems = await Promise.all(
                faqData.map(async (item: any) => {
                    return {
                        question: item.question,
                        answer: item.answer,
                    };
                })
            );
            await layoutModel.create({ type: "FAQ", faq: faqItems });
        }
        if (type === 'Categories') {
            const { categories } = req.body;
            const categoriesItem = await Promise.all(
                categories.map(async (item: any) => {
                    return {
                        title: item.title,
                    };
                })
            );
            await layoutModel.create({ type: "Categories", categories: categoriesItem });
        }

        res.status(200).json({
            success: true,
            message: "Layout Created Successfully",
        });

    } catch (error: any) {
        next(new ErrorHandler(error.message, 400));
    }
});


//Edit Layout
export const editLayout = catchAsyncerror(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { type } = req.body;
        if (type === "Banner") {
            const bannerData: any = await layoutModel.findOne({ type: "Banner" });
            const { image, title, subTitle } = req.body;

            const data = image.startsWith("https") ? bannerData : await cloudinary.v2.uploader.upload(image, {
                folder: "Layout",
            });

            const banner = {
                type: "Banner",
                image: {
                    public_id: image.startsWith("https") ? bannerData.banner.image.public_id : data?.public_id,
                    url: image.startsWith("https") ? bannerData.banner.image.url : data?.secure_url,
                },
                title,
                subTitle,
            };
            // if (bannerData) {
            //     await cloudinary.v2.uploader.destroy(bannerData.image.public_id);
            // }
            // const myCloud = await cloudinary.v2.uploader.upload(image, {
            //     folder: "Layout",
            // });


            await layoutModel.findByIdAndUpdate(bannerData._id, { banner });
        }

        if (type === 'FAQ') {
            const { faqData } = req.body;
            const faqItem = await layoutModel.findOne({ type: "FAQ" });
            const faqItems = await Promise.all(
                faqData.map(async (item: any) => {
                    return {
                        question: item.question,
                        answer: item.answer,
                    };
                })
            );
            await layoutModel.findByIdAndUpdate(faqItem?._id, { type: "FAQ", faq: faqItems });
        }
        if (type === 'Categories') {
            const { categories } = req.body;
            const categoriesData = await layoutModel.findOne({ type: "Categories" });
            const categoriesItem = await Promise.all(
                categories.map(async (item: any) => {
                    return {
                        title: item.title,
                    };
                })
            );
            await layoutModel.findByIdAndUpdate(categoriesData?._id, { type: "Categories", categories: categoriesItem });
        }

        res.status(200).json({
            success: true,
            message: "Layout updated Successfully",
        });
    } catch (error: any) {
        next(new ErrorHandler(error.message, 400));
    }
});


//Get Layout by Type
export const getLayoutByType = catchAsyncerror(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { type } = req.params;
        const layout = await layoutModel.findOne({ type });
        res.status(201).json({
            success: true,
            layout,
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});

