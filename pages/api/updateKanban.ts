import type { NextApiRequest, NextApiResponse } from 'next';
import { getRow, putRow } from '../../common/services/client';
import { TableName } from '@consts/service';
import { genId } from '@utils/tools';
import { ReqBody, ResBody, ServiceRelation } from '@types';
import { ServiceKanban } from '../../common/services';

export default async function handler(
  req: NextApiRequest,
  res: ResBody<{ id: string }>,
) {
  const {
    token,
    id = genId(),
    name,
    settings,
    deleted,
  } = req?.body as ReqBody<ServiceKanban>;

  const { id: user_id } = (await getRow(TableName.token, { token })) as {
    id: string;
  };

  if (!user_id) {
    res.send({
      success: false,
      message: '未登陆',
      code: 403,
    });
    return;
  }

  const { user_id: _, ...relation } = await getRow<ServiceRelation>(
    TableName.relation,
    {
      user_id,
    },
  );

  const kanban = {
    uid: user_id,
    settings: JSON.stringify(settings),
    deleted: !!deleted,
    name,
    updated: Date.now(),
  };

  await putRow(TableName.kanban, { id }, kanban);
  relation.category_ids = `5lmdsylizgkld493haur,7m9xmqlizgkld5fgflai,3w6h4slizgkld59l2my3,98rswzlizgkld6fart4d,9tnbhalizgkld67lg68o,3r22wjlizgkld78lm1a5,1cjnellizgkld79yvjrk,ax8436lizgkld79v74ca,b3n88ilizgkld772syav,a6us75lizgkld72iz9wp,a53adclizgkld7ec7t19,ui68slizgkld8ae9ifr,b0dcjilizgkld85gyxjb,ds16lklizgkld889804a,am8fj0lizgkld93ar7j0,6n5kjslizgkld9btfji1,8hi8xglizgkld9fope5n,b9gc01lizgkldb9r4q6z,46acn7lizgkldbb4c9cj,cyhri7lizgkldb47yhqo,4lu222lizgkldd47tz3c,c9zl8alizgkldd9etk22,8lvlg4lizgkldf6ds1wv,3lkytnlizgkldmg17iky,a2keq8lizgkldv1drj5a,ecg88zlizgkldwbubm15,4w659blizgkle19luaki,29tj2slizgkle2fjvfgi,2htoyllizgklf82pqz84,ddlp5rlizgklfn4h9e63,g5clq1lizgklfx20hd2z,1e6aqflizgklg781v9fd,1u83cslizgklgjc55k1z,53tiuflq12nmkz317vlb,fofmaclq12tyvw6hmlvl,1qtifnlq2f6vgfgbhqln,537xsglq2fdwqug244r1`;
  const kanban_ids = new Set(relation.kanban_ids?.split(',').filter(Boolean));
  kanban_ids.add(id);
  relation.kanban_ids = Array.from(kanban_ids).join(',');
  await putRow(TableName.relation, { user_id }, relation);

  res.send({
    success: true,
    data: { id },
  });
}
