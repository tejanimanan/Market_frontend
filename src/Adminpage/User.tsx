// pages/UserPage.tsx

import React, { useEffect, useState } from "react";
import TempTable from "../component/Model/TempTable";
import FormModal from "../component/Model/FormModal";
import { USER_TABLE_COLUMNS } from "../utils/helpers/TableColumns";
import { USER_FORM_FIELDS } from "../utils/helpers/FormField";
import { message } from "antd";
import { Switch } from "antd";
import Swal from "sweetalert2";
import {
  getAllUsers,
  createUser as createUserService,
  updateUser as updateUserService,
  deleteUser as deleteUserService,
} from "../services/userService";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  setUsers,
  addUser,
  updateUser as updateUserAction,
  removeUser,
  setLoading,
  setError,
} from "../redux/slices/userSlice";
import type { UserData } from "../redux/slices/userSlice";
import { toast, ToastContainer } from "react-toastify";

const UserPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { users, loading, error } = useAppSelector((state) => state.user);

  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editData, setEditData] = useState<UserData | null>(null);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);

  const fetchUsers = async (search: string = "") => {
    dispatch(setLoading(true));
    try {
      const result = await getAllUsers({
        pageNumber: currentPage,
        pageSize: pageSize,
        search: search,
      });

      const transformedData: UserData[] = result.data.map((user: any) => ({
        key:
          user.id?.toString() ||
          `user-${Math.random().toString(36).substr(2, 9)}`,
          uid:user.uid,
        name: user.name,
        email: user.email,
        contact: user.contact,
        role: user.role || "Unknown",
        status: user.status == 1 ? "active" : "inactive",
      }));

      dispatch(setUsers(transformedData));
      setTotalUsers(result.total || 0);
    } catch (error) {
      dispatch(setError("Failed to fetch users"));
      message.error("Failed to fetch users");
      console.error("Fetch users error:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    fetchUsers(searchText);
  }, [dispatch, currentPage, pageSize, searchText]);

  const handleSearch = (value: string) => {
    setSearchText(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleTableChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  const createUser = async (values: UserData) => {
    dispatch(setLoading(true));
    try {
      const userData = {
        uid:values.uid,
        name: values.name,
        email: values.email,
        contact: values.contact,
        role: values.role,
        status: values.status === "active",
        password: values.password || "",
      };
      const response = await createUserService(userData);
      console.log("response for create",response)
      if (response?.data?.id) {
        const newUser: UserData = {
          key: response.data.id.toString(),
          uid: values.uid,
          name: values.name,
          email: values.email,
          contact: values.contact,
          role: values.role,
          status: values.status,
        };
        dispatch(addUser(newUser));
        toast.success("User created successfully");
        await fetchUsers();
      } else {
        dispatch(setError(response?.data?.message || "Failed to create user"));
        toast.error(response?.data?.message || "Failed to create user");
      }
    } catch (error: any) {
      console.error("Create user error:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to create user";
      dispatch(setError(errorMessage));
      toast.error(errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const updateUser = async (key: string, values: UserData) => {
    dispatch(setLoading(true));
    try {
      const userData: {
        uid:number;
        name: string;
        email: string;
        contact: string;
        role: string;
        status: boolean;
        password?: string;
      } = {
        uid:values.uid,
        name: values.name,
        email: values.email,
        contact: values.contact,
        role: values.role,
        status: values.status === "active",
      };

      // Only include password if it's provided
      if (values.password) {
        userData.password = values.password;
      }

      const response = await updateUserService(parseInt(key), userData);
      if (response?.data?.id) {
        const updatedUser: UserData = {
          key: key,
          uid:values.uid,
          name: values.name,
          email: values.email,
          contact: values.contact,
          role: values.role,
          status: values.status,
        };
        dispatch(updateUserAction(updatedUser));
        toast.success("User updated successfully");
        await fetchUsers();
      } else {
        dispatch(setError(response?.data?.message || "Failed to update user"));
        toast.error(response?.data?.message || "Failed to update user");
      }
    } catch (error: any) {
      console.error("Update user error:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to update user";
      dispatch(setError(errorMessage));
      toast.error(errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const deleteUser = async (key: string) => {
    dispatch(setLoading(true));
    try {
      const response = await deleteUserService(parseInt(key));
      if (response?.status == 201) {
        await fetchUsers(searchText);
        message.success("User deleted successfully");
      } else {
        dispatch(setError(response?.data?.message || "Failed to delete user"));
        message.error(response?.data?.message || "Failed to delete user");
      }
    } catch (error) {
      console.error("Delete user error:", error);
      dispatch(setError("Failed to delete user"));
      message.error("Failed to delete user");
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleStatusToggle = async (userId: string, isActive: boolean) => {
    dispatch(setLoading(true));
    try {
      const userData = {
        status: isActive,
      };

      const response = await updateUserService(parseInt(userId), userData);
      if (response?.data?.id) {
        const updatedUser: UserData = {
          key: userId,
          uid:editData?.uid,
          name: editData?.name || "",
          email: editData?.email || "",
          contact: editData?.contact || "",
          role: editData?.role || "",
          status: isActive ? "active" : "inactive",
        };
        dispatch(updateUserAction(updatedUser));
        toast.success("Status updated successfully");
        await fetchUsers();
      } else {
        dispatch(
          setError(response?.data?.message || "Failed to update status")
        );
        toast.error(response?.data?.message || "Failed to update status");
      }
    } catch (error: any) {
      console.error("Status update error:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to update status";
      dispatch(setError(errorMessage));
      message.error(errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const statusToggleColumn = {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (text: string, record: any) => (
      <Switch
        checked={text === "active"}
        onChange={(checked) => handleStatusToggle(record.key, checked)}
        style={{
          backgroundColor: text === "active" ? "#52c41a" : "#d9d9d9", // green / gray
        }}
      />
    ),
  };

  const columns = [...USER_TABLE_COLUMNS];
  columns[columns.length - 1] = statusToggleColumn;

  const handleEdit = (record: UserData) => {
    setIsEdit(true);
    setEditData(record);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setIsEdit(false);
    setEditData(null);
    setModalOpen(true);
  };

  const handleDelete = (key: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteUser(key);
      }
    });
  };

  return (
    <>
     <ToastContainer position="top-right" autoClose={3000} />
      <TempTable
        title="User Management"
        columns={columns}
        data={users}
        searchKey="name"
        onCreate={handleCreate}
        createButtonText="Add User"
        onEdit={handleEdit}
        onDelete={handleDelete}
        required={true}
        loading={loading}
        onSearch={handleSearch}
        onTableChange={handleTableChange}
        currentPage={currentPage}
        pageSize={pageSize}
        total={totalUsers}
      />

      <FormModal
        open={modalOpen}
        title={isEdit ? "Edit User" : "Create User"}
        formFields={USER_FORM_FIELDS}
        initialValues={editData || {}}
        onCancel={() => {
          setModalOpen(false);
          setEditData(null);
        }}
        onSubmit={(values) => {
          if (isEdit && editData) {
            updateUser(editData.key, values);
          } else {
            createUser(values);
          }
          setModalOpen(false);
          setEditData(null);
        }}
        isEdit={isEdit}
        loading={loading}
      />
    </>
  );
};

export default UserPage;
