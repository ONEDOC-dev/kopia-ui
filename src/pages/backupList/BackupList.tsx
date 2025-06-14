import React, { useEffect, useState } from "react";
import {Box, IconButton, Stack} from "@mui/joy";
import AddList from "@/components/backupList/AddList";
import { Cached } from "@mui/icons-material";
import {DataGrid, GridColDef, GridRowParams} from "@mui/x-data-grid";
import useSource from "@/api/v1/useSource";
import {formatBytes, padTwoDigits, formatDates} from '@/utils/utils';
import useSnapshot from "@/api/v1/useSnapshot";
import {useRepositoryStatusStore} from "@/store/useRepositoryStatusStore";
import BackupListDelete from "@/components/backupList/BackupListDelete";
import ActionButtons from "@/components/backupList/ActionButtons";
import {useNavigate} from "react-router-dom";

interface BackupListProps {
  id: string;
  backupDir: string;
  totalVolume: number;
  backupTime: string[];
  lastBackupTime: string;
}

const BackupList = () => {
  const {getSources} = useSource();
  const {deleteSnapshot} = useSnapshot();
  const {repositoryStatus} = useRepositoryStatusStore();
  const navigate = useNavigate();
  const [backupList, setBackupList] = useState<BackupListProps[]>([]);
  const [selectList, setSelectList] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    getBackupList()
  }, []);

  const getBackupList = async () => {
    setIsLoading(true);
    await getSources()
      .then(result => {
        const _backupList: BackupListProps[] = [];
        result.sources.map((res, idx) => {
          _backupList.push({
            id: res.source.path,
            backupDir: res.source.path,
            backupTime: res.schedule.timeOfDay?.map(val => `${padTwoDigits(val.hour)}:${padTwoDigits(val.min)}`) || [],
            totalVolume: res.lastSnapshot.stats.totalSize,
            lastBackupTime: res.lastSnapshot.endTime
          });
        });
        setBackupList(_backupList);
      })
      .catch(err => {
        console.log(err)
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  const handleSnapshotDelete = async () => {
    if (selectList && repositoryStatus){
      setIsLoading(true);
      for (const value of selectList){
        await deleteSnapshot({
          source: {
            host: repositoryStatus.hostname!,
            userName: repositoryStatus.username!,
            path: String(value)
          },
          deleteSourceAndPolicy: true
        })
          .then(() => {
            getBackupList();
          })
          .catch((error) => {
            console.log(error);
          }).finally(() => {
            setIsLoading(false);
          });
      }
    }
  }

  const columns: GridColDef[] = [
    { field: 'backupDir', flex: 2, headerName: '백업 경로(원본)' },
    { field: 'totalVolume', flex: 1, headerName: '현재 총 용량', valueGetter: (value) => formatBytes(value) },
    { field: 'backupTime', flex: 1, headerName: '백업 시간' },
    { field: 'lastBackupTime', flex: 1, headerName: '마지막 백업', valueGetter: (value) => formatDates(value) },
    { field: 'actions', flex: 2, headerName: '액션', renderCell: (params) => (<ActionButtons params={params} onFresh={getBackupList} />)},
  ];

  return (
    <Box sx={{width:'100%', height: '100%', display: 'flex', flexDirection: 'column'}} gap={2}>
      <Stack flexDirection={'row'} justifyContent={'space-between'} alignItems={'center'}>
        <Stack flexDirection={'row'} gap={1}>
          <BackupListDelete deleteList={selectList} onDelete={handleSnapshotDelete} />
        </Stack>
        <Stack flexDirection={'row'} gap={1}>
          <AddList onAdd={getBackupList} />
          <IconButton loading={isLoading} sx={{backgroundColor: '#3D76FE', '&:hover': {backgroundColor: '#5E8DFF'}}} onClick={() => getBackupList()}><Cached htmlColor={'#FFF'} /></IconButton>
        </Stack>
      </Stack>
      <Stack flex={1} flexDirection={'column'} sx={{height: '100%', overflowX: 'auto'}}>
        <DataGrid
          rows={backupList}
          columns={columns}
          checkboxSelection
          autosizeOnMount
          disableRowSelectionOnClick
          onRowSelectionModelChange={(select) => setSelectList(select.ids as Set<string>)}
          onRowClick={(params: GridRowParams) => navigate(`/snapshotList/${encodeURIComponent(params.id)}`) }
        />
      </Stack>
    </Box>
  )
}

export default BackupList;