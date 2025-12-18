import { NextResponse } from "next/server";
export async function GET(){return NextResponse.json({ok:true,service:"web-api",ts:new Date().toISOString()});}
