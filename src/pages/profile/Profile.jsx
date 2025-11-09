import { useLocation, useParams } from "react-router-dom"

export default function Profile() {
   
    const profID = useParams().id ?? null
    if (!profID)
    {
        return (<>
                 tham số không hợp lệ
        </>)
    }
    return (
        <>
        profile {profID}
        </>
    )
}