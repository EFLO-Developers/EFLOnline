
import MainTemplate from "../../layout/PageTemplates/Main/main";
import AuthorizedTemplate from '../../layout/PageTemplates/Authorized';
import PlayerUpdate from "../../components/PlayerUpdate/PlayerUpdate";
import PlayerCreate from "../../components/PlayerCreation/PlayerCreation";

export default function PlayerCreatePage() {


      
    
    
    return (
        <AuthorizedTemplate>
            <MainTemplate>    
                <PlayerCreate />
            </MainTemplate>
        </AuthorizedTemplate>
)};