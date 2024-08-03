import { useState } from "react";
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Box, IconButton, Typography, useTheme, Avatar } from "@mui/material";
import { Link } from "react-router-dom";
import { tokens } from "../../theme";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import ContactsOutlinedIcon from "@mui/icons-material/ContactsOutlined";
import BookOutlinedIcon from '@mui/icons-material/BookOutlined';
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import VideoCameraFrontOutlinedIcon from '@mui/icons-material/VideoCameraFrontOutlined';
import "react-pro-sidebar/dist/css/styles.css";

const Sidebar = () => {
    const theme = useTheme();
    const colours = tokens(theme.palette.mode);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [selected, setSelected] = useState('Dashboard');

    return (
        <Box 
            sx={{
                "& .pro-sidebar-inner": {
                    background: `${colours.primary[400]} !important`
                },
                "& .pro-icon-wrapper": {
                    backgroundColor: `transparent !important `
                },
                "& .pro-inner-item": {
                    padding: "5px 35px 5px 20px !important"
                },
                "& .pro-inner-item:hover": {
                    color: "#868dfb !important"
                },
                "& .pro-menu-item.active": {
                    color: "#6870fa !important"
                },
            }}
        >
            <ProSidebar collapsed={isCollapsed}>
                <Menu iconShape="square">
                    <MenuItem
                        icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        style={{ margin: "10px 0 20px 0" }}
                    >
                        {!isCollapsed && (
                            <Box
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                                ml="15px"
                            >
                                <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                                    <MenuOutlinedIcon />
                                </IconButton>
                            </Box>
                        )}
                    </MenuItem>
                    {!isCollapsed && (
                        <Box display="flex" flexDirection="column" alignItems="center" mb="25px">
                            <Avatar 
                                src="https://via.placeholder.com/150" 
                                alt="Profile" 
                                sx={{ width: 150, height: 150, mb: 2 }} 
                            />
                            <Typography variant="h6" color={colours.grey[100]}>
                                John Doe
                            </Typography>
                            <Typography variant="body2" color={colours.grey[300]}>
                                johndoe@example.com
                            </Typography>
                        </Box>
                    )}
                    <MenuItem 
                        icon={<HomeOutlinedIcon />} 
                        active={selected === "Dashboard"} 
                        onClick={() => setSelected("Dashboard")} 
                    >
                        <Typography>Dashcam</Typography>
                        <Link to="/" />
                    </MenuItem>
                    <MenuItem 
                        icon={<VideoCameraFrontOutlinedIcon />} 
                        active={selected === "Footage"} 
                        onClick={() => setSelected("Footage")} 
                    >
                        <Typography>Previous Dashcam Footage</Typography>
                        <Link to="/footage" />
                    </MenuItem>
                    <MenuItem 
                        icon={<BookOutlinedIcon />} 
                        active={selected === "References"} 
                        onClick={() => setSelected("References")} 
                    >
                        <Typography>References</Typography>
                        <Link to="/references" />
                    </MenuItem>
                </Menu>
            </ProSidebar>
        </Box>
    );
};

export default Sidebar;