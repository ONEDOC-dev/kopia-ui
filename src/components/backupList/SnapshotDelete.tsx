import React, {useState} from "react";
import {Button, Checkbox, Stack, Typography} from "@mui/joy";
import BaseModal from "@/components/common/BaseModal";

export interface SnapshotListDeleteProps {
  deleteList: Set<string | number>;
  onDelete: (isCheck: boolean) => void;
  totalCount: number;
}

const snapshotDelete = ({deleteList, onDelete, totalCount}: SnapshotListDeleteProps) => {
  const [open, setOpen] = useState<boolean>(false);
  const [isCheck, setIsCheck] = useState<boolean>(false);

  return (
    <>
      <Button
        variant={'outlined'}
        sx={{width: '100px', color: '#3D76FE', borderColor: '#3D76FE'}}
        disabled={!deleteList || deleteList.size === 0}
        onClick={() => setOpen(true)}
      >
        삭제
      </Button>
      <BaseModal open={open} setOpen={setOpen} title={'스냅샷 삭제'}
                 content={
                   <Stack>
                     <Typography>{deleteList.size}개의 리스트를 삭제 하시겠습니까?</Typography>
                     {deleteList.size == totalCount &&
                       <Checkbox label={'해당 백업 자체도 삭제'} onChange={() => setIsCheck(!isCheck)} />
                     }
                   </Stack>
                 }
                 actions={
                    <>
                      <Button sx={{width: '150px'}} variant={'outlined'} color={'neutral'} onClick={() => setOpen(false)}>취소</Button>
                      <Button sx={{width: '150px'}} variant={'solid'} color={'danger'} onClick={() => {setOpen(false); onDelete(isCheck);}}>석제</Button>
                    </>
                 }
      />
    </>
  )
}

export default snapshotDelete;