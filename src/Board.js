import React from "react";
import Dragula from "dragula";
import "dragula/dist/dragula.css";
import Swimlane from "./Swimlane";
import "./Board.css";

export default class Board extends React.Component {
  constructor(props) {
    super(props);
    // Load all clients but place them into the backlog swimlane.
    // Ensure their status reflects the swimlane so card colors match the lane.
    const clients = this.getClients().map((c) => ({ ...c, status: "backlog" }));
    this.state = {
      // Put all tasks into the backlog swimlane for the "Shipping Requests" view
      clients: {
        backlog: clients,
        inProgress: [],
        complete: [],
      },
    };
    this.swimlanes = {
      backlog: React.createRef(),
      inProgress: React.createRef(),
      complete: React.createRef(),
    };
  }
  getClients() {
    return [
      [
        "1",
        "Stark, White and Abbott",
        "Cloned Optimal Architecture",
        "in-progress",
      ],
      [
        "2",
        "Wiza LLC",
        "Exclusive Bandwidth-Monitored Implementation",
        "complete",
      ],
      [
        "3",
        "Nolan LLC",
        "Vision-Oriented 4Thgeneration Graphicaluserinterface",
        "backlog",
      ],
      [
        "4",
        "Thompson PLC",
        "Streamlined Regional Knowledgeuser",
        "in-progress",
      ],
      [
        "5",
        "Walker-Williamson",
        "Team-Oriented 6Thgeneration Matrix",
        "in-progress",
      ],
      ["6", "Boehm and Sons", "Automated Systematic Paradigm", "backlog"],
      [
        "7",
        "Runolfsson, Hegmann and Block",
        "Integrated Transitional Strategy",
        "backlog",
      ],
      ["8", "Schumm-Labadie", "Operative Heuristic Challenge", "backlog"],
      [
        "9",
        "Kohler Group",
        "Re-Contextualized Multi-Tasking Attitude",
        "backlog",
      ],
      ["10", "Romaguera Inc", "Managed Foreground Toolset", "backlog"],
      ["11", "Reilly-King", "Future-Proofed Interactive Toolset", "complete"],
      [
        "12",
        "Emard, Champlin and Runolfsdottir",
        "Devolved Needs-Based Capability",
        "backlog",
      ],
      [
        "13",
        "Fritsch, Cronin and Wolff",
        "Open-Source 3Rdgeneration Website",
        "complete",
      ],
      [
        "14",
        "Borer LLC",
        "Profit-Focused Incremental Orchestration",
        "backlog",
      ],
      [
        "15",
        "Emmerich-Ankunding",
        "User-Centric Stable Extranet",
        "in-progress",
      ],
      [
        "16",
        "Willms-Abbott",
        "Progressive Bandwidth-Monitored Access",
        "in-progress",
      ],
      ["17", "Brekke PLC", "Intuitive User-Facing Customerloyalty", "complete"],
      [
        "18",
        "Bins, Toy and Klocko",
        "Integrated Assymetric Software",
        "backlog",
      ],
      [
        "19",
        "Hodkiewicz-Hayes",
        "Programmable Systematic Securedline",
        "backlog",
      ],
      ["20", "Murphy, Lang and Ferry", "Organized Explicit Access", "backlog"],
    ].map((companyDetails) => ({
      id: companyDetails[0],
      name: companyDetails[1],
      description: companyDetails[2],
      status: companyDetails[3],
    }));
  }
  renderSwimlane(name, clients, ref) {
    return <Swimlane name={name} clients={clients} dragulaRef={ref} />;
  }

  componentDidMount() {
    // Collect swimlane container DOM nodes
    const containers = [
      this.swimlanes.backlog.current,
      this.swimlanes.inProgress.current,
      this.swimlanes.complete.current,
    ].filter(Boolean);

    // Initialize Dragula for reordering within a lane and moving between lanes
    this.drake = Dragula(containers);

    this.drake.on("drop", (el, target, source, sibling) => {
      if (!target || !source) return;

      const id = el.getAttribute("data-id");
      const sourceKey = this.getSwimlaneKeyFromContainer(source);
      const targetKey = this.getSwimlaneKeyFromContainer(target);
      if (!sourceKey || !targetKey) return;

      // Prevent Dragula from manipulating the DOM directly; React will update DOM based on new state.
      // This avoids "removeChild is not a child" errors when React re-renders.
      this.drake.cancel(true);

      this.setState((prev) => {
        // Clone arrays to avoid mutating prev state
        const clients = {
          ...prev.clients,
          [sourceKey]: [...(prev.clients[sourceKey] || [])],
          [targetKey]: [...(prev.clients[targetKey] || [])],
        };

        // Remove item from source list
        const itemIndex = clients[sourceKey].findIndex((c) => c.id === id);
        if (itemIndex === -1) return null;
        const [item] = clients[sourceKey].splice(itemIndex, 1);

        // Update status when moving between swimlanes
        const statusMap = {
          backlog: "backlog",
          inProgress: "in-progress",
          complete: "complete",
        };
        item.status = statusMap[targetKey] || item.status;

        // Determine insert index in target using sibling (null => append)
        let insertIndex = clients[targetKey].length;
        if (sibling) {
          const siblingId = sibling.getAttribute("data-id");
          const siblingIndex = clients[targetKey].findIndex(
            (c) => c.id === siblingId
          );
          insertIndex =
            siblingIndex === -1 ? clients[targetKey].length : siblingIndex;
        }

        // Insert the moved item into target list at the correct index
        clients[targetKey].splice(insertIndex, 0, item);

        return {
          clients: {
            ...prev.clients,
            [sourceKey]: clients[sourceKey],
            [targetKey]: clients[targetKey],
          },
        };
      });
    });
  }

  componentWillUnmount() {
    if (this.drake) {
      this.drake.destroy();
      this.drake = null;
    }
  }

  getSwimlaneKeyFromContainer(container) {
    if (container === this.swimlanes.backlog.current) return "backlog";
    if (container === this.swimlanes.inProgress.current) return "inProgress";
    if (container === this.swimlanes.complete.current) return "complete";
    return null;
  }

  render() {
    return (
      <div className="Board">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-4">
              {this.renderSwimlane(
                "Backlog",
                this.state.clients.backlog,
                this.swimlanes.backlog
              )}
            </div>
            <div className="col-md-4">
              {this.renderSwimlane(
                "In Progress",
                this.state.clients.inProgress,
                this.swimlanes.inProgress
              )}
            </div>
            <div className="col-md-4">
              {this.renderSwimlane(
                "Complete",
                this.state.clients.complete,
                this.swimlanes.complete
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
