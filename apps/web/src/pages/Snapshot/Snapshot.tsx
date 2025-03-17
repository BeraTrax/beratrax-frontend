import {
  useSnapshotJoinSpace,
  useSnapshotSpace,
  useSnapshotSpaceProposals,
  useSnapshotVote,
} from "@beratrax/core/src/hooks/useSnapshot";
import "./Snapshot.css";
import { ProposalCard } from "src/components/ProposalCard/ProposalCard";
import { Skeleton } from "src/components/Skeleton/Skeleton";
import useTokens from "@beratrax/core/src/state/tokens/useTokens";
import tokens from "@beratrax/core/src/config/constants/tokens";
import { useMemo, useState } from "react";
import { Tabs } from "src/components/Tabs/Tabs";
import PoolButton from "src/components/PoolButton/PoolButton";
import { SNAPSHOT_APP_NAME, SNAPSHOT_SPACE_ID } from "@beratrax/core/src/config/constants";
import { CHAIN_ID } from "src/types/enums";

export const Snapshot = () => {
  const { joinSpace, loadingJoinSpace } = useSnapshotJoinSpace();
  const { loadingSpace, space, isMember } = useSnapshotSpace();
  const [tab, setTab] = useState<"Beratrax" | "Artbitrum">("Beratrax");
  const snapshotSpaceId = useMemo(() => (tab === "Beratrax" ? SNAPSHOT_SPACE_ID : "arbitrumfoundation.eth"), [tab]);
  const snapshotSpaceName = useMemo(() => (tab === "Beratrax" ? SNAPSHOT_APP_NAME : "Arbitrum DAO"), [tab]);
  const { loadingSpaceProposals, loadingSpaceVotes, proposals, votes, fetchSpaceProposal, fetchSpaceVotes } =
    useSnapshotSpaceProposals(snapshotSpaceId);

  const traxBalance = 0;

  return (
    <div className="snapshot-container">
      <Tabs>
        <PoolButton
          variant={2}
          onClick={() => {
            setTab("Beratrax");
          }}
          description={"Beratrax"}
          active={tab === "Beratrax"}
        />
        <PoolButton
          variant={2}
          onClick={() => {
            setTab("Artbitrum");
          }}
          description={"Artbitrum"}
          active={tab === "Artbitrum"}
        />
      </Tabs>
      {/* <h4> */}
      {/* {space?.name} (${space?.symbol}) */}
      {/* </h4> */}
      {/* <p>Space details: {space?.about}</p> */}
      {/* <p>Space members: </p> */}
      {/* {space?.members.map((e) => (
                <li key={e}>{e}</li>
            ))} */}
      {/* {!isMember && (
                <button disabled={loadingJoinSpace} onClick={joinSpace}>
                    Join Space
                </button>
            )} */}
      {tab === "Beratrax" && (
        <div>
          <h5 style={{ marginTop: 20, marginBottom: 0 }}>Proposals</h5>
          <p className={"btx"} style={{ marginTop: 0, marginBottom: 30 }}>
            {traxBalance && `BTX balance: ${traxBalance}`}
          </p>
        </div>
      )}
      {/* {proposals?.map((e, index) => {
                return (
                    <div key={e.id}>
                        <div>
                            {index + 1}. {e.title}
                        </div>
                        <div>{e.body}</div>
                        {e.choices.map((c, i) => (
                            <ProposalChoiceButton key={c} proposalId={e.id} choice={c} choiceNumber={i + 1} />
                        ))}
                    </div>
                );
            })} */}
      <div className="proposal-list">
        {loadingSpaceProposals ? (
          <>
            <Skeleton w={"100%"} h={300} inverted />
            <Skeleton w={"100%"} h={300} inverted />
            <Skeleton w={"100%"} h={300} inverted />
            <Skeleton w={"100%"} h={300} inverted />
            <Skeleton w={"100%"} h={300} inverted />
            <Skeleton w={"100%"} h={300} inverted />
          </>
        ) : (
          proposals?.map((item, i) => (
            <ProposalCard
              id={item.id}
              description={item.body}
              choices={item.choices}
              scores={item.scores}
              totalScore={item.scores_total}
              status={item.state}
              title={item.title}
              votedChoice={votes?.find((vote) => vote.proposal.id === item.id)}
              fetchVotes={fetchSpaceVotes}
              loadingVotes={loadingSpaceVotes}
              end={item.end}
              snapshotAppName={snapshotSpaceName}
              snapshotId={snapshotSpaceId}
            />
          ))
        )}
      </div>
    </div>
  );
};
