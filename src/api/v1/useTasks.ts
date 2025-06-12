import {useCallback} from "react";
import instance from "@/api/v1/index";
import {TasksResponse} from "@/types/apis/tasksType";

const useTasks = () => {
  const getTasks = useCallback(async (): Promise<{tasks: TasksResponse[]}> => {
    try {
      return await instance.get(`/tasks`);
    } catch (error) {
      return Promise.reject(error);
    }
  }, [instance]);

  const getTasksById = useCallback(async (taskId: string): Promise<TasksResponse> => {
    try {
      return await instance.get(`/tasks/${taskId}`);
    } catch (error) {
      return Promise.reject(error);
    }
  }, [instance]);

  return {
    getTasksById,
    getTasks
  }
}

export default useTasks;