export const UserRoleEnum = {
    ADMIN : "admin",
    PROJECT_ADMIN : "project_admin",
    MEMBER : "member"
}

export const AvailableUserRole = Object.values(UserRoleEnum)  // .values returns ---> Arrray   ---> ["admin", "project_admin", "member"]


export const TaskStatusEnum ={ 
    TODO:"todo",
    IN_PROGRESS:"In_progress",
    DONE:"done"

}
export const AvailableTaskStatus = Object.values(TaskStatusEnum)