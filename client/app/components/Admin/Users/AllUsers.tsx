import React, { FC, useEffect, useState } from 'react';
import { DataGrid } from "@mui/x-data-grid";
import { Box, Button, Modal } from "@mui/material";
import { AiOutlineDelete, AiOutlineMail } from 'react-icons/ai';
import { useTheme } from 'next-themes';
import Loader from '../../Loader/Loader';
import { format } from "timeago.js";
import { useGetAllUsersQuery } from '@/redux/features/user/userApi';
import { styles } from '@/app/styles/style';
import toast from 'react-hot-toast';

type Props = {
    isTeam: boolean;
};

const AllCourses: FC<Props> = ({ isTeam }) => {
    const { theme, setTheme } = useTheme();
    const [active, setActive] = useState(false);
    const { isLoading, data, refetch } = useGetAllUsersQuery({}, { refetchOnMountOrArgChange: true });
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("admin");
    const [open, setOpen] = useState(false);
    const [userId, setUserId] = useState("");
    // const [updateUserRole, { error: updateError, isSuccess }] = useUpdateUserRoleMutation();
    // const [deleteUser, { isSuccess: deleteSuccess, error: deleteError }] = useDeleteUserMutation({});

    // useEffect(() => {
    //     if (updateError) {
    //         if ("data" in updateError) {
    //             const errorMessage = updateError as any;
    //             toast.error(errorMessage.data.message);
    //         }
    //     }
    //     if (isSuccess) {
    //         refetch();
    //         toast.success("User role updated successfully");
    //         setActive(false);
    //     }
    //     if (deleteSuccess) {
    //         refetch();
    //         toast.success("Delete user successfully");
    //         setOpen(false);
    //     }
    //     if (deleteError) {
    //         if ("data" in deleteError) {
    //             const errorMessage = deleteError as any;
    //             toast.error(errorMessage.data.message);
    //         }
    //     }
    // }, [updateError, isSuccess, deleteSuccess, deleteError])

    const columns = [
        { field: "id", headerName: "ID", flex: 0.3 },
        { field: "name", headerName: "Name", flex: .5 },
        { field: "email", headerName: "Email", flex: .5 },
        { field: "role", headerName: "Role", flex: .5 },
        { field: "courses", headerName: "Purchased Courses", flex: 0.5 },
        { field: "created_at", headerName: "Joined At", flex: 0.5 },
        {
            field: " ",
            headerName: "Delete",
            flex: 0.2,
            renderCell: (params: any) => {
                return (
                    <>
                        <Button onClick={() => {
                            setOpen(!open);
                            setUserId(params.row.id);
                        }}>
                            <AiOutlineDelete
                                className="dark:text-white text-black"
                                size={20}
                            />
                        </Button>
                    </>
                );
            },
        },
        {
            field: " ",
            headerName: "Email",
            flex: 0.2,
            renderCell: (params: any) => {
                return (
                    <>
                        <a href={`mailto:${params.row.email}`}>
                            <AiOutlineMail
                                className="dark:text-white text-black"
                                size={20}
                            />
                        </a>
                    </>
                );
            },
        },
    ];

    const rows: any = [];
    if (isTeam) {
        const newData = data && data.users.filter((item: any) => item.role === "admin");
        newData && newData.forEach((item: any) => {
            rows.push({
                id: item._id,
                name: item.name,
                email: item.email,
                role: item.role,
                courses: item.courses.length,
                created_at: format(item.createdAt),
            })
        })
    } else {
        data && data.users.forEach((item: any) => {
            rows.push({
                id: item._id,
                name: item.name,
                email: item.email,
                role: item.role,
                courses: item.courses.length,
                created_at: format(item.createdAt),
            })
        })
    }

    // const handleSubmit = async () => {
    //     await updateUserRole({ email, role });
    // }
    // const handleDelete = () => {

    // };

    return (
        <div className="mt-[120px]">
            {
                isLoading ? (
                    <Loader />
                ) : (
                    <Box m="20px">
                        <div className="w-full flex justify-end">
                            <div className={`${styles.button} !w-[200px] !rounded-[10px] !h-[35px] dark:border dark:border-[#fff]`}
                                onClick={() => setActive(!active)}
                            >
                                Add New Member
                            </div>
                        </div>
                        <Box
                            m="40px 0 0 0"
                            height="80vh"
                            sx={{
                                "& .MuiDataGrid-root": {
                                    border: "none",
                                    outline: "none",
                                },
                                "& .css-pqjvzy-MuiSvgIcon-root-MuiSelect-icon": {
                                    color: theme === "dark" ? "#fff" : "#000",
                                },
                                "& .MuiDataGrid-sortIcon": {
                                    color: theme === "dark" ? "#fff" : "#000",
                                },
                                "& .MuiDataGrid-row": {
                                    color: theme === "dark" ? "#fff" : "#000",
                                    borderBottom:
                                        theme === "dark"
                                            ? "1px solid #ffffff30!important"
                                            : "1px solid #ccc!important",
                                },
                                "& .MuiTablePagination-root": {
                                    color: theme === "dark" ? "#fff" : "#000",
                                },
                                "& .MuiDataGrid-cell": {
                                    borderBottom: "none",
                                },
                                "& .name-column--cell": {
                                    color: theme === "dark" ? "#fff" : "#000",
                                },
                                "& .MuiDataGrid-columnHeaders": {
                                    backgroundColor: theme === "dark" ? "#3e4396" : "#A4A9FC",
                                    borderBottom: "none",
                                    color: theme === "dark" ? "#fff" : "#000",
                                },
                                "& .MuiDataGrid-virtualScroller": {
                                    backgroundColor: theme === "dark" ? "#1F2A40" : "#F2F0F0",
                                },
                                "& .MuiDataGrid-footerContainer": {
                                    color: theme === "dark" ? "#fff" : "#000",
                                    borderTop: "none",
                                    backgroundColor: theme === "dark" ? "3e4396" : "#A4A9FC",
                                },
                                "& .MuiCheckbox-root": {
                                    color: theme === "dark" ? `#b7ebde !important` : `#000 !important`,
                                },
                                "& MuiDataGrid-toolbarContainer .MuiButton-text": {
                                    color: `#fff !important`,
                                },
                            }}
                        >
                            <DataGrid checkboxSelection rows={rows} columns={columns} />
                        </Box>
                        {/* {active && (

                        )} */}
                        {open && (
                            <Modal
                                open={open}
                                onClose={() => setOpen(!open)}
                                aria-labelledby="modal-modal-title"
                                aria-describedby="modal-modal-description"
                            >
                                <Box className="absolute top-[50%] left-[50%] -translate-x-1/2 ">
                                    <h1 className={`${styles.title}`}>
                                        Are you sure you want to delete this user?
                                    </h1>
                                    <div>
                                        <div className={`${styles.button} !w-[120px] h-[30px] `}
                                            onClick={() => setOpen(!open)}
                                        >
                                            Cancel
                                        </div>
                                        <div
                                            className={`${styles.button} ml-[10px] !w-[120px] h-[30px] `}
                                            // onClick={handleDelete}
                                        >
                                            Delete
                                        </div>
                                    </div>
                                </Box>
                            </Modal>
                        )}
                    </Box>
                )}
        </div>
    )
}

export default AllCourses;