// import { useRefreshQuery } from "../../redux/auth/sliceApi";
import { IUser } from "../../helper/Auth.types";
import { useAuth } from "../../Hooks";
import { Greating, HomePageContainer } from "./HomePageStyled";



export default function Home() {
  // const {data: user} = useRefreshQuery()
  const { user } = useAuth()as { user: IUser };

    return (
      <HomePageContainer>
             <Greating>
          Hello {!user?.name ?'': user?.name }!

        </Greating>
        <Greating>
          Welcome to ToDo List App.
        </Greating>
      </HomePageContainer>
    );
  }
  