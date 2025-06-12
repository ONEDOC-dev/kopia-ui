import {Button} from "@mui/joy";
import React, {useState} from "react";
import BaseModal from "@/components/common/BaseModal";

export interface BackupListDeleteProps {
  deleteList: Set<string | number>;
  onDelete: () => void;
}

const BackupListDelete = ({deleteList, onDelete}: BackupListDeleteProps) => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <>
      <Button
        variant={'outlined'}
        sx={{width: '100px', color: '#3D76FE', borderColor: '#3D76FE'}}
        disabled={!deleteList || deleteList.size === 0}
        onClick={() => setOpen(!open)}
      >
        삭제
      </Button>
      <BaseModal open={open} setOpen={setOpen}
                 title={'백업리스트 삭제'}
                 content={`${deleteList.size}개의 백업리스트를 삭제하겠습니까?`}
                 actions={
                   <>
                     <Button sx={{width: '150px'}} variant={'outlined'} color={'neutral'} onClick={() => setOpen(false)}>취소</Button>
                     <Button sx={{width: '150px'}} variant={'solid'} color={'danger'} onClick={() => {setOpen(false); onDelete();}}>석제</Button>
                   </>
                 }
      />
    </>
  );
}

export default BackupListDelete;