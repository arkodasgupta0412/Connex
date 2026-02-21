import SettingsIcon from "@mui/icons-material/Settings";
import Button from "../../button/Button";
import "./SettingsButton.css";


const SettingsButton = ({ onClick }) => {
    return (
        <Button 
            variant="icon"
            className="settings-btn" 
            onClick={onClick} 
            title="Settings"
        >
            <SettingsIcon />
        </Button>
    );
}

export default SettingsButton;