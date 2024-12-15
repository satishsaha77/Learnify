import mongoose,{Document,Model,Schema} from "mongoose";




export interface Order extends Document{
    courseId:string;
    userId: string;
    paymentInfo:object;
}

const orderSchema=new Schema<Order>({
    courseId: {type:String,required:true},
    userId: {
        type:String,
        required:true
    },
    paymentInfo:{
        type:Object,
        //required:true
    }
},{timestamps:true});

const orderModel: Model<Order>=mongoose.model('Order',orderSchema);

export default orderModel;

