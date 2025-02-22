const  mongoose =  require('mongoose');
//user-->subject-->class-->date/present/absent
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email:{
        type:String,
        required: true,

    },
    password:{
        type: String,
        required:false,
        unique:false,
    },
    subjects: [
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Subjects",
        }
    ]
});
const SubjectSchema = new mongoose.Schema(
    {
     subName: {
        type:String,
        required: true,
     },
     teacherName:{
        type: String,
        required: true,
     },
     PercentageRequires:{
        type:Number,
        default: 33,
     },
    present:{
        type: Number,
         default: 0,
    },
    absent:{
        type: Number,
        default: 0,
    }
    }
)
const ClassSchema = new mongoose.Schema({
    date: {
        type:Date,
        required: true,
    },
    present:{
        type: Boolean,
        required: true,
    }
});
 const ClassUsers =  mongoose.model("ClassUsers", UserSchema);
 const Subjects = mongoose.model("Subjects", SubjectSchema);
 const ClassModel = mongoose.model("ClassModel", ClassSchema);
 module.exports = {ClassUsers, Subjects, ClassModel}