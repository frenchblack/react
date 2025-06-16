import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export const usePreviousPath = () => {
    // const location = useLocation();
    // const prevPathRef = useRef(null);

    // useEffect(() => {
    // prevPathRef.current = location.pathname;
    // }, [location]);
    const location = useLocation();
    const prevPathRef = useRef(null);
    const currentPathRef = useRef(location.pathname);

    useEffect(() => {
    prevPathRef.current = currentPathRef.current;  // 이전값 저장
    currentPathRef.current = location.pathname;    // 현재값 갱신
    }, [location.pathname]);

    return prevPathRef.current;
}