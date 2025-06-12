import React, {useEffect, useState} from 'react';
import {Box, Button, IconButton, Stack, Typography} from "@mui/joy";
import {useNavigate, useParams} from "react-router-dom";
import {ArrowBack, Cached} from '@mui/icons-material';
import useSnapshot from "@/api/v1/useSnapshot";
import {useRepositoryStatusStore} from "@/store/useRepositoryStatusStore";
import {DataGrid, GridColDef} from "@mui/x-data-grid";
import {formatBytes} from "@/utils/utils";
import dayjs from "dayjs";
import SnapshotDelete from "@/components/backupList/SnapshotDelete";

interface SnapshotListProps {
  id: string;
  startTime: string;
  totalVolume: number;
  fileCount: number;
  folderCount: number;
}

const SnapshotList = () => {
  const param = useParams();
  const navigate = useNavigate();
  const {getSnapshot, deleteSnapshot} = useSnapshot();
  const {repositoryStatus} = useRepositoryStatusStore();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [snapshotList, setSnapshotList] = useState<SnapshotListProps[]>([]);
  const [selectList, setSelectList] = useState<Set<string>>(new Set());
  const [totalCount, setTotalCount] = useState<number>(0);

  const columns: GridColDef[] = [
    { field: 'startTime', flex: 2, headerName: '시작 시간', valueGetter: (value) => dayjs(value).format("YYYY-MM-DD HH:mm:ss") },
    { field: 'totalVolume', flex: 1, headerName: '용량', valueGetter: (value) => formatBytes(value) },
    { field: 'fileCount', flex: 1, headerName: '파일 개수' },
    { field: 'folderCount', flex: 1, headerName: '폴더 개수' },
  ]

  useEffect(() => {
    handleRefresh()
  }, []);

  const handleRefresh = async () => {
    setIsLoading(true);
    await getSnapshot({
      userName: repositoryStatus.username!,
      host: repositoryStatus.hostname!,
      path: param.path!
    })
      .then(result => {
        const _snapshotList: SnapshotListProps[] = []
        if (result.snapshots.length > 0){
          setTotalCount(result.snapshots.length);
          result.snapshots.map((res) => {
            _snapshotList.push({
              id: res.id,
              startTime: res.startTime,
              totalVolume: res.summary.size,
              fileCount: res.summary.files,
              folderCount: res.summary.dirs
            })
          });
        }
        setSnapshotList(_snapshotList);
      })
      .catch(error => {
        console.log(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  const handleDelete = async (isCheck: boolean) => {
    if (selectList && repositoryStatus){
      setIsLoading(true);
      for (const value of selectList) {
        await deleteSnapshot({
          source: {
            host: repositoryStatus.hostname!,
            userName: repositoryStatus.username!,
            path: param.path!
          },
          ...(isCheck
            ? {deleteSourceAndPolicy: isCheck}
            : {snapshotManifestIds: [value]})
        })
          .then(() => {
            handleRefresh();
          })
          .catch((error) => {
            console.log(error);
          }).finally(() => {
            setIsLoading(false);
          });
      }
    }
  }

  return (
    <Box sx={{width:'100%', height: '100%', display: 'flex', flexDirection: 'column'}} gap={2}>
      <Stack flexDirection={'row'} alignItems={'center'} gap={3}>
        <Button variant={'outlined'} sx={{width: '150px'}} startDecorator={<ArrowBack />} onClick={() => navigate(-1)}>뒤로가기</Button>
        <Typography level={'h4'}>{param.path}</Typography>
      </Stack>
      <Stack flexDirection={'row'} alignItems={'center'} justifyContent={'space-between'}>
        <SnapshotDelete totalCount={totalCount} onDelete={handleDelete} deleteList={selectList} />
        <IconButton loading={isLoading} sx={{backgroundColor: '#3D76FE', '&:hover': {backgroundColor: '#5E8DFF'}}} onClick={() => handleRefresh()}><Cached htmlColor={'#FFF'} /></IconButton>
      </Stack>
      <Stack flex={1} flexDirection={'column'} sx={{height: '100%', overflowX: 'auto'}}>
        <DataGrid
          rows={snapshotList}
          columns={columns}
          checkboxSelection
          autosizeOnMount
          disableRowSelectionOnClick
          onRowSelectionModelChange={(select) => setSelectList(select.ids as Set<string>)}
        />
      </Stack>
    </Box>
  )
}

export default SnapshotList;