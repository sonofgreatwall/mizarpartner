"use client"
import Link from "next/link";
import Button from "./components/Button";
import { useState } from "react";
import { Bars3BottomLeftIcon } from "@heroicons/react/24/outline";

export default function TopBar(){
    const [sideBarActive, setSideBarActive] = useState(false)
    
    return(
        <div className="md:relative fixed z-40 top-0 left-0 w-screen flex justify-between items-center px-4 md:px-10 min-h-16 md:py-5 py-4 text-sm bg-white">
          <div className="gap-8 items-center hidden md:flex font-semibold">
            <Link href="." className="text-center inline-block">Blog</Link>
            <Link href="." className="text-center inline-block">FAQ</Link>
            <Link href="." className="text-center inline-block">Event</Link>
            <Link href="." className="text-center inline-block">About</Link>
          </div>
          <div className="flex items-center">
            <div className="md:hidden inline-block pr-6" onClick={() => setSideBarActive(!sideBarActive)}>
              <Bars3BottomLeftIcon className="h-6 w-6" />
            </div>
            <Link href="/" className="font-light text-2xl
              md:absolute
              md:top-1/2
              md:left-1/2
              md:-translate-x-1/2
              md:-translate-y-1/2 
            ">SeattleListed</Link>
          </div>
          <div 
            className={`h-screen p-10 w-screen fixed topbar top-0 left-0 transition-all ease-in-out duration-500 ${sideBarActive? 'translate-x-0' : '-translate-x-full'}`}
            onClick={() => setSideBarActive(false)}
            >
              <div className="gap-8 items-center flex flex-col text-lg">
                <Link href="." className="text-center inline-block">Blog</Link>
                <Link href="." className="text-center inline-block">FAQ</Link>
                <Link href="." className="text-center inline-block">Event</Link>
                <Link href="." className="text-center inline-block">About</Link>
              </div>
            </div>
          <div onClick={() => setSideBarActive(false)} className={`w-fit md:px-4 grid md:flex md:gap-2 items-center ${sideBarActive? '' : ''}`}>
          <Link href="">
            <Button className="w-full hidden md:block">Log in</Button>
          </Link>
          <Link href="/register">
            <Button className="py-4" variant="primary">Sign up</Button>
          </Link>
            </div>
        </div>
    )
}