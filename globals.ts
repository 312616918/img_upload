declare interface Task{
    uid:string;
    name:string;
    startTime:number;
    endTime:number;
}

declare interface ImageRecord{
    name:string;
    path:string;
    timestamp:number;
    label:string;
}

declare interface Late{
    [name:string]:{
        lateTimes:number;
        totalTimes:number;
    }
}